import { db } from "../firebase";
import { updateDoc, doc } from "firebase/firestore";
import { Button, CircularProgress } from "@mui/material";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import "./ResultAuthorised.css";
import { useTheme } from "@emotion/react";
import { html2pdf } from "html2pdf.js";
import { useAuth } from "../Contexts/AuthContext";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

function ResultAuthorised({ bookingData, handleUpdateStatesInfo, statesInfo }) {
    const { isLoggedIn, authUser, role } = useAuth();

console.log(role);
// console.log(!role === "admin");

  const theme = useTheme();


const getPageMargins = () => {
  return `@page { margin: ${"0cm"} ${"0cm"} ${"0"} ${"0cm"} !important;}`;
};

const getCss = () => {
  return `@media print { thead { display: table-header-group; } tfoot { display: table-footer-group; } td { padding: 5mm 25.4mm; } }`;
  // return `@page { padding: 5cm 0cm 5cm 0cm }`;
};

  const pageStyle = {
    width: "210mm",
    height: "297mm",
    overflowY: "scroll",
    border: "2px solid black",
  };

  const [isCompleted, setIsCompleted] = useState(bookingData.isCompleted);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthorise = async () => {
    setIsLoading(true);
    const bookingRef = doc(db, "bookings", bookingData.id);

    try {
      const updatedStatesInfo = statesInfo.map((state) => {
        if (state.state === "resultAuthorized") {
          return {
            ...state,
            updatedAt: new Date(),
          };
        }
        return state;
      });
      handleUpdateStatesInfo(updatedStatesInfo);
      const updates = {
        isCompleted: true,
        statesInfo: updatedStatesInfo,
      };

      await updateDoc(bookingRef, updates).then(() => {
        console.log("updated----");
        setIsCompleted(true);
      });
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const Report = () => {
    return (
      <div style={pageStyle}>
        <div
          ref={contentToPrint}
          style={{
            display: "flex",
            flexDirection: "column",
            // padding: "0cm 2.54cm",
            fontSize: "10px",
            fontFamily: "Verdana",
            overflowWrap: "break-word",
            textAlign: "justify",
            pageBreakAfter: "always",
          }}
        >
          <style>{getPageMargins()}</style>

          <div className="header">
            <img src="/header.png" alt="Dr. Avani's Oncopath Lab Header" />
          </div>

          <div className="footer">
            <img src="/footer.png" alt="Dr. Avani's Oncopath Lab Footer" />
          </div>

          <div className="logo">
            <img src="/logo.png" alt="Dr. Avani's Oncopath Lab" />
          </div>

          <table>
            <thead>
              <tr>
                <th>
                  <div class="page-header-space"></div>
                  {/* <img
                    src="/header.png"
                    alt="Dr. Avani's Oncopath Lab Header"
                  /> */}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <h1
                    style={{
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: "1000",
                      marginBottom: "20px",
                    }}
                  >
                    {bookingData.typeOfSpecimen.category} REPORT
                  </h1>
                  <div style={{ display: "flex", flexDirection: "row" }}>
                    <p>
                      <span>S. No: </span>
                      <b>{bookingData.serialNumber}</b>
                    </p>
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <p>
                        <span>Patient Name: </span>
                        <b>{bookingData.patientName}</b>
                      </p>
                      <p>
                        <span>Age/Sex: </span>
                        <b>
                          {bookingData.age} / {bookingData.sex}
                        </b>
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <p>
                        <span>Referred : </span>
                        <b>{bookingData.referralDoctor.name}</b>
                      </p>
                      <p>
                        <span>Date of Receipt: </span>
                        <b>
                          {bookingData.bookingDate
                            .toDate()
                            .toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              timeZone: "Asia/Kolkata",
                            })}
                        </b>
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <p>
                        <span>Hospital Name:</span>
                        <b>{bookingData.hospital.name}</b>
                      </p>
                      <p>
                        <span>Date of Reporting:</span>
                        <b>
                          {bookingData.statesInfo[3].updatedAt
                            .toDate()
                            .toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              timeZone: "Asia/Kolkata",
                            })}
                        </b>
                      </p>
                    </div>
                  </div>
                  <hr
                    class="solid"
                    style={{
                      width: "110%",
                      position: "relative",
                      left: "-5%",
                      border: `1px solid ${theme.palette.primary.main}`,
                      margin: "20px 0px",
                    }}
                  />
                  <div style={{ margin: "20px 0px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "1000" }}>
                      SPECIMEN
                    </div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: bookingData.resultEnteredDetails.specimen,
                      }}
                    />
                  </div>
                  <div style={{ margin: "20px 0px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "1000" }}>
                      DIAGNOSIS
                    </div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: bookingData.resultEnteredDetails.diagnosis,
                      }}
                    />
                  </div>
                  <div style={{ margin: "20px 0px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "1000" }}>
                      COMMENTS
                    </div>
                    <span>{bookingData.comments}</span>
                  </div>
                  <div style={{ margin: "20px 0px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "1000" }}>
                      MICROSCOPIC FINDINGS
                    </div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          bookingData.resultEnteredDetails
                            .microscopicDescription,
                      }}
                    />
                  </div>
                  <div style={{ margin: "20px 0px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "1000" }}>
                      GROSS FINDINGS
                    </div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: bookingData.grossDescription,
                      }}
                    />
                  </div>
                  <div style={{ margin: "20px 0px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "1000" }}>
                      LIST of SECTIONS
                    </div>
                    {bookingData?.listOfSectionsDetails.map((i) => {
                      return (
                        <ul>
                          <li>
                            <b>
                              {i.name.length > 0 ? (
                                <>
                                  <span>{i.prefix + " " + i.name}</span>
                                </>
                              ) : (
                                <span>{i.description}</span>
                              )}
                            </b>
                          </li>
                        </ul>
                      );
                    })}
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th>
                  <div class="page-footer-space"></div>
                  {/* <img
                    className="footer"
                    src="/footer.png"
                    alt="Dr. Avani's Oncopath Lab Footer"
                  /> */}
                </th>
              </tr>
            </tfoot>
          </table>
          <style>{getCss()}</style>
        </div>
      </div>
    );
  };

  const contentToPrint = useRef(null);
  const handlePrint = useReactToPrint({
   
    documentTitle: `${bookingData.serialNumber} - ${bookingData.patientName}`,
    onBeforePrint: () => console.log("before printing..."),
    onAfterPrint: () => console.log("after printing..."),
    removeAfterPrint: true,
  });



  return (
    <div>
      {bookingData ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Report />
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-evenly",
              margin: "10px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Button
                variant="contained"
                disabled={!bookingData.isCompleted}
                onClick={() => {
                  handlePrint(null, () => contentToPrint.current);
                }}
                style={{ padding: "10px 20px" }}
                startIcon={<FileDownloadIcon />}
              >
                Generate Report
                {isLoading && <CircularProgress size="small" />}
              </Button>
              <p style={{ color: "#b71c1c", fontWeight: "900" }}>
                Report Authorisation Pending
              </p>
            </div>
            {role === "admin" ? (
              <Button
                variant="contained"
                onClick={handleAuthorise}
                startIcon={<TaskAltIcon />}
                // disabled={role === ("receptionist" || "technician") }
              >
                Authorise
              </Button>
            ) : null}
            {/* <Button
              variant="outlined"
              onClick={handleAuthorise}
              // disabled={role === ("receptionist" || "technician") }
            >
              Authorise
            </Button> */}
          </div>
        </div>
      ) : (
        <CircularProgress />
      )}
    </div>
  );
}

export default ResultAuthorised;
