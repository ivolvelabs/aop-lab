const {HttpsError, onCall} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const normalizeString = (value) => String(value || "").trim();

const normalizeEmail = (value) => normalizeString(value).toLowerCase();

const normalizeTeamMembers = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeString).filter(Boolean);
};

const requireFields = (data, fields) => {
  const missingFields = fields.filter((field) => !normalizeString(data[field]));
  if (missingFields.length > 0) {
    throw new HttpsError(
        "invalid-argument",
        `Missing required fields: ${missingFields.join(", ")}`,
    );
  }
};

const mapAuthError = (error, fallbackMessage) => {
  if (error instanceof HttpsError) return error;

  if (error?.code === "auth/email-already-exists") {
    return new HttpsError("already-exists", "Email already exists");
  }

  if (error?.code === "auth/invalid-password") {
    return new HttpsError("invalid-argument", "Password is invalid or weak");
  }

  if (error?.code === "auth/invalid-email") {
    return new HttpsError("invalid-argument", "Email address is invalid");
  }

  if (error?.code === "auth/user-not-found") {
    return new HttpsError("not-found", "Auth user was not found");
  }

  return new HttpsError("internal", fallbackMessage);
};

const isAccountActive = (data) => data?.active !== false && !data?.archivedAt;

const assertAdmin = async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Sign in is required");
  }

  const userDoc = await admin.firestore().collection("users").doc(uid).get();
  const userData = userDoc.data();

  if (!userDoc.exists || userData?.role !== "admin" || !isAccountActive(userData)) {
    throw new HttpsError("permission-denied", "Admin access is required");
  }

  return {uid, user: userData};
};

const getThirdPartySnapshot = async (thirdPartyId) => {
  const id = normalizeString(thirdPartyId);
  if (!id) {
    throw new HttpsError("invalid-argument", "Missing thirdPartyId");
  }

  const ref = admin.firestore().collection("thirdparty").doc(id);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new HttpsError("not-found", "Third-party record was not found");
  }

  const data = snapshot.data() || {};
  if (!["doctor", "hospital"].includes(data.type)) {
    throw new HttpsError("invalid-argument", "Invalid third-party record type");
  }

  return {ref, snapshot, data};
};

const syncBookingThirdPartySnapshots = async (thirdPartyId, type, fields) => {
  const bookingPartyField = type === "doctor" ? "referralDoctor" : "hospital";
  const snapshot = await admin.firestore()
      .collection("bookings")
      .where(`${bookingPartyField}.id`, "==", thirdPartyId)
      .get();

  if (snapshot.empty) return;

  let batch = admin.firestore().batch();
  let count = 0;

  for (const bookingDoc of snapshot.docs) {
    const updatePayload = {};
    Object.entries(fields).forEach(([key, value]) => {
      updatePayload[`${bookingPartyField}.${key}`] = value;
    });
    updatePayload.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    batch.update(bookingDoc.ref, updatePayload);
    count += 1;

    if (count === 450) {
      await batch.commit();
      batch = admin.firestore().batch();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
  }
};

exports.createUser = onCall(async (request) => {
  try {
    const data = request.data || {};
    requireFields(data, ["email", "password", "fullName", "role"]);

    const email = normalizeEmail(data.email);
    const fullName = normalizeString(data.fullName);
    const role = normalizeString(data.role);
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const userRecord = await admin
        .auth()
        .createUser({
          email,
          password: data.password,
          displayName: fullName,
        });

    await admin.firestore().collection("users").doc(userRecord.uid).set({
      authUid: userRecord.uid,
      fullName,
      email,
      role,
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return {
      message: "User created successfully!",
      uid: userRecord.uid,
    };
  } catch (error) {
    console.error("createUser failed:", error);
    throw mapAuthError(error, "Failed to create user");
  }
});


exports.createThirdParty = onCall(async (request) => {
  try {
    const data = request.data || {};
    requireFields(data, ["email", "password", "name", "type"]);

    const email = normalizeEmail(data.email);
    const name = normalizeString(data.name);
    const type = normalizeString(data.type);
    const role = normalizeString(data.role) || "thirdparty";
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    if (!["doctor", "hospital"].includes(type)) {
      throw new HttpsError(
          "invalid-argument",
          "Third-party type must be doctor or hospital",
      );
    }

    const thirdPartyRecord = await admin
        .auth()
        .createUser({
          email,
          password: data.password,
          displayName: name,
        });

    await admin.firestore().collection("thirdparty").doc(thirdPartyRecord.uid)
        .set({
          authUid: thirdPartyRecord.uid,
          name,
          email,
          role,
          type,
          address: normalizeString(data.address),
          phone: normalizeString(data.phone),
          teamMembers: normalizeTeamMembers(data.teamMembers),
          active: true,
          loginAccess: true,
          credentialsStatus: "enabled",
          createdAt: timestamp,
          updatedAt: timestamp,
        });

    return {
      message: "Third party created successfully!",
      uid: thirdPartyRecord.uid,
    };
  } catch (error) {
    console.error("createThirdParty failed:", error);
    throw mapAuthError(error, "Failed to create third party");
  }
});

exports.attachThirdPartyLogin = onCall(async (request) => {
  let thirdPartyRecord = null;

  try {
    const adminContext = await assertAdmin(request);
    const data = request.data || {};
    requireFields(data, ["thirdPartyId", "email", "password"]);

    const email = normalizeEmail(data.email);
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const {ref, data: thirdPartyData} = await getThirdPartySnapshot(
        data.thirdPartyId,
    );

    if (thirdPartyData.authUid) {
      throw new HttpsError(
          "failed-precondition",
          "This third-party record already has login credentials",
      );
    }

    thirdPartyRecord = await admin.auth().createUser({
      email,
      password: data.password,
      displayName: normalizeString(thirdPartyData.name),
    });

    await ref.update({
      authUid: thirdPartyRecord.uid,
      email,
      role: normalizeString(thirdPartyData.role) || "thirdparty",
      active: true,
      loginAccess: true,
      credentialsStatus: "enabled",
      credentialsCreatedAt: timestamp,
      credentialsCreatedBy: adminContext.uid,
      updatedAt: timestamp,
    });

    await syncBookingThirdPartySnapshots(data.thirdPartyId, thirdPartyData.type, {
      authUid: thirdPartyRecord.uid,
      email,
      loginAccess: true,
      credentialsStatus: "enabled",
    });

    return {
      message: "Third-party login created successfully!",
      uid: thirdPartyRecord.uid,
    };
  } catch (error) {
    if (thirdPartyRecord?.uid) {
      try {
        await admin.auth().deleteUser(thirdPartyRecord.uid);
      } catch (cleanupError) {
        console.error("attachThirdPartyLogin cleanup failed:", cleanupError);
      }
    }

    console.error("attachThirdPartyLogin failed:", error);
    throw mapAuthError(error, "Failed to create third-party login");
  }
});

exports.resetThirdPartyPassword = onCall(async (request) => {
  try {
    const adminContext = await assertAdmin(request);
    const data = request.data || {};
    requireFields(data, ["thirdPartyId", "password"]);

    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const {ref, data: thirdPartyData} = await getThirdPartySnapshot(
        data.thirdPartyId,
    );

    if (!thirdPartyData.authUid) {
      throw new HttpsError(
          "failed-precondition",
          "This third-party record does not have login credentials",
      );
    }

    await admin.auth().updateUser(thirdPartyData.authUid, {
      password: data.password,
    });

    await ref.update({
      credentialsStatus: thirdPartyData.loginAccess === false ?
        "disabled" :
        "enabled",
      passwordUpdatedAt: timestamp,
      passwordUpdatedBy: adminContext.uid,
      updatedAt: timestamp,
    });

    return {message: "Third-party password updated successfully!"};
  } catch (error) {
    console.error("resetThirdPartyPassword failed:", error);
    throw mapAuthError(error, "Failed to reset third-party password");
  }
});

exports.setThirdPartyLoginAccess = onCall(async (request) => {
  try {
    const adminContext = await assertAdmin(request);
    const data = request.data || {};
    requireFields(data, ["thirdPartyId"]);

    const loginAccess = Boolean(data.loginAccess);
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const {ref, data: thirdPartyData} = await getThirdPartySnapshot(
        data.thirdPartyId,
    );

    if (!thirdPartyData.authUid) {
      throw new HttpsError(
          "failed-precondition",
          "This third-party record does not have login credentials",
      );
    }

    await admin.auth().updateUser(thirdPartyData.authUid, {
      disabled: !loginAccess,
    });

    await ref.update({
      loginAccess,
      credentialsStatus: loginAccess ? "enabled" : "disabled",
      loginAccessUpdatedAt: timestamp,
      loginAccessUpdatedBy: adminContext.uid,
      updatedAt: timestamp,
    });

    await syncBookingThirdPartySnapshots(data.thirdPartyId, thirdPartyData.type, {
      loginAccess,
      credentialsStatus: loginAccess ? "enabled" : "disabled",
    });

    return {
      message: loginAccess ?
        "Third-party login enabled successfully!" :
        "Third-party login disabled successfully!",
    };
  } catch (error) {
    console.error("setThirdPartyLoginAccess failed:", error);
    throw mapAuthError(error, "Failed to update third-party login access");
  }
});
