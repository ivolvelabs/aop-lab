import { db } from "../firebase";
import { arrayUnion, updateDoc, doc } from "firebase/firestore";
import { Button, CircularProgress } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import "./ResultAuthorised.css";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../Contexts/AuthContext";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { sanitizeHtml } from "../utils/sanitizeHtml";
import { toDateValue } from "../utils/dateFormat";
import { buildWorkflowEvent } from "../utils/workflowAudit";

const htmlHasVisibleContent = (value) => {
  if (!value || typeof value !== "string") return false;

  const textOnly = sanitizeHtml(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();

  return textOnly.length > 0;
};

const textHasVisibleContent = (value) =>
  typeof value === "string" && value.trim().length > 0;

const formatReportDate = (value) => {
  const date = toDateValue(value);
  if (!date) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

const SectionHeading = ({ children }) => (
  <div className="report-section-heading">{children}</div>
);

const HtmlReportSection = ({ title, html }) => {
  if (!htmlHasVisibleContent(html)) return null;

  return (
    <section className="report-section">
      <SectionHeading>{title}</SectionHeading>
      <div
        className="report-rich-text"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
      />
    </section>
  );
};

const TextReportSection = ({ title, text }) => {
  if (!textHasVisibleContent(text)) return null;

  return (
    <section className="report-section">
      <SectionHeading>{title}</SectionHeading>
      <div className="report-rich-text">{text}</div>
    </section>
  );
};

function ResultAuthorised({ bookingData, handleUpdateStatesInfo, statesInfo }) {
  const { role, user } = useAuth();
  const theme = useTheme();
  const contentToPrint = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isReportAuthorized, setIsReportAuthorized] = useState(
    Boolean(bookingData?.isCompleted)
  );

  useEffect(() => {
    setIsReportAuthorized(Boolean(bookingData?.isCompleted));
  }, [bookingData?.isCompleted]);

  const reportData = useMemo(() => {
    const stateList = Array.isArray(bookingData?.statesInfo)
      ? bookingData.statesInfo
      : Array.isArray(statesInfo)
      ? statesInfo
      : [];
    const resultEnteredState = stateList.find(
      (state) => state.state === "resultEntered"
    );
    const resultAuthorizedState = stateList.find(
      (state) => state.state === "resultAuthorized"
    );
    const resultDetails = bookingData?.resultEnteredDetails || {};
    const sections = Array.isArray(bookingData?.listOfSectionsDetails)
      ? bookingData.listOfSectionsDetails.filter(
          (item) =>
            textHasVisibleContent(item?.name) ||
            textHasVisibleContent(item?.description)
        )
      : [];

    return {
      category: bookingData?.typeOfSpecimen?.category || "PATHOLOGY",
      serialNumber: bookingData?.serialNumber || "-",
      patientName: bookingData?.patientName || "-",
      age: bookingData?.age || "-",
      sex: bookingData?.sex || "-",
      referralDoctor: bookingData?.referralDoctor?.name || "-",
      hospital: bookingData?.hospital?.name || "-",
      receiptDate: formatReportDate(bookingData?.bookingDate),
      reportingDate: formatReportDate(
        resultEnteredState?.updatedAt ||
          stateList[3]?.updatedAt ||
          resultAuthorizedState?.updatedAt
      ),
      specimen: resultDetails.specimen,
      diagnosis: resultDetails.diagnosis,
      comments: bookingData?.comments,
      microscopicDescription: resultDetails.microscopicDescription,
      grossDescription: bookingData?.grossDescription,
      sections,
    };
  }, [bookingData, statesInfo]);

  const handleAuthorise = async () => {
    setIsLoading(true);
    const bookingRef = doc(db, "bookings", bookingData.id);

    try {
      const updatedStatesInfo = statesInfo.map((state) => {
        if (state.state === "resultAuthorized") {
          return {
            ...state,
            isDone: true,
            updatedAt: new Date(),
          };
        }
        return state;
      });

      const updates = {
        isCompleted: true,
        statesInfo: updatedStatesInfo,
        workflowHistory: arrayUnion(
          buildWorkflowEvent({
            step: "resultAuthorized",
            action: bookingData?.isCompleted
              ? "Report re-authorized"
              : "Report authorized",
            user,
          })
        ),
      };

      await updateDoc(bookingRef, updates);
      handleUpdateStatesInfo(updatedStatesInfo);
      setIsReportAuthorized(true);
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => contentToPrint.current,
    documentTitle: `${reportData.serialNumber} - ${reportData.patientName}`,
    removeAfterPrint: true,
    pageStyle: "@page { size: A4; margin: 0; }",
  });

  const Report = () => (
    <div className="report-page-shell">
      <article ref={contentToPrint} className="report-print-root">
        <div className="report-fixed-header">
          <img src="/header.png" alt="Dr. Avani's Oncopath Lab Header" />
        </div>

        <div className="report-watermark" aria-hidden="true">
          <img src="/logo.png" alt="" />
        </div>

        <div className="report-fixed-footer">
          <img src="/footer.png" alt="Dr. Avani's Oncopath Lab Footer" />
        </div>

        <div className="report-content">
          <h1 className="report-title">{reportData.category} REPORT</h1>

          <div className="report-meta report-meta-single">
            <p>
              <span>S. No: </span>
              <b>{reportData.serialNumber}</b>
            </p>
          </div>

          <div className="report-meta">
            <p>
              <span>Patient Name: </span>
              <b>{reportData.patientName}</b>
            </p>
            <p>
              <span>Age/Sex: </span>
              <b>
                {reportData.age} / {reportData.sex}
              </b>
            </p>
          </div>

          <div className="report-meta">
            <p>
              <span>Referred : </span>
              <b>{reportData.referralDoctor}</b>
            </p>
            <p>
              <span>Date of Receipt: </span>
              <b>{reportData.receiptDate}</b>
            </p>
          </div>

          <div className="report-meta">
            <p>
              <span>Hospital Name: </span>
              <b>{reportData.hospital}</b>
            </p>
            <p>
              <span>Date of Reporting: </span>
              <b>{reportData.reportingDate}</b>
            </p>
          </div>

          <hr
            className="report-divider"
            style={{ borderColor: theme.palette.primary.main }}
          />

          <HtmlReportSection title="SPECIMEN" html={reportData.specimen} />
          <HtmlReportSection title="DIAGNOSIS" html={reportData.diagnosis} />
          <TextReportSection title="COMMENTS" text={reportData.comments} />
          <HtmlReportSection
            title="MICROSCOPIC FINDINGS"
            html={reportData.microscopicDescription}
          />
          <HtmlReportSection
            title="GROSS FINDINGS"
            html={reportData.grossDescription}
          />

          {reportData.sections.length > 0 ? (
            <section className="report-section">
              <SectionHeading>LIST of SECTIONS</SectionHeading>
              <ul className="report-section-list">
                {reportData.sections.map((item, index) => {
                  const sectionName = [item.prefix, item.name]
                    .filter(Boolean)
                    .join(" ")
                    .trim();

                  return (
                    <li
                      key={`${sectionName || "section"}-${
                        item.description || ""
                      }-${index}`}
                    >
                      <b>
                        {sectionName ? <span>{sectionName}</span> : null}
                        {sectionName && item.description ? " : " : null}
                        {item.description ? (
                          <span>{item.description}</span>
                        ) : null}
                      </b>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      </article>
    </div>
  );

  return (
    <div>
      {bookingData ? (
        <div className="report-authorized-screen">
          <Report />
          <div className="report-actions">
            <div className="report-primary-action">
              <Button
                variant="contained"
                disabled={!isReportAuthorized}
                onClick={handlePrint}
                style={{ padding: "10px 20px" }}
                startIcon={<FileDownloadIcon />}
              >
                Generate Report
                {isLoading && <CircularProgress size={16} color="inherit" />}
              </Button>
              {!isReportAuthorized ? (
                <p className="report-pending-text">
                  Report Authorisation Pending
                </p>
              ) : null}
            </div>
            {role === "admin" ? (
              <Button
                variant="contained"
                onClick={handleAuthorise}
                disabled={isLoading}
                startIcon={<TaskAltIcon />}
              >
                {isReportAuthorized ? "Re-authorise" : "Authorise"}
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <CircularProgress />
      )}
    </div>
  );
}

export default ResultAuthorised;
