import { Button, CircularProgress } from "@mui/material";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useTheme } from "@emotion/react";
import { useLocation } from "react-router-dom";
import html2pdf from "html2pdf.js";
import "./MyBookings.css";
import { ReactPDF, PDFViewer, Document, Page, View, Text, PDFDownloadLink } from "@react-pdf/renderer";

const MyDoc = (
  <Document>
    <Page>// My document data</Page>
  </Document>
);


function MyBookings({props}) {

let location = useLocation();

    let bookingData = location.state;
    // console.log(location.state);
  const theme = useTheme();

  const pageStyle = {
    width: "210mm",
    height: "297mm",
    overflowY: "scroll",
    border: "2px solid black",
  };

  const [isLoading, setIsLoading] = useState(false);

  const Report = () => {
    return (
      <div style={pageStyle}>
        <div
          ref={contentToPrint}
          style={{
            padding: "0.1in 0.1in",
            fontSize: "10px",
            fontFamily: "Verdana",
            overflowWrap: "break-word",
          }}
        >
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
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              // justifyContent: "space-between",
            }}
          >
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
                  {bookingData.bookingDate.toDate().toLocaleString("en-IN", {
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
                  {new Date(
                    bookingData.statesInfo[3].updatedAt
                  ).toLocaleString("en-IN", {
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
              border: `1px solid ${theme.palette.primary.main}`,
              margin: "20px 0px",
            }}
          />

          {/* <div style={{ margin: "20px 0px" }}>
            <div style={{ fontSize: "12px", fontWeight: "1000" }}>SPECIMEN</div>
            <span>{bookingData.resultEnteredDetails.specimen}</span>
          </div> */}
          <div style={{ margin: "20px 0px" }}>
            <div style={{ fontSize: "12px", fontWeight: "1000" }}>SPECIMEN</div>
            <div
              dangerouslySetInnerHTML={{
                __html: bookingData.resultEnteredDetails.specimen,
              }}
            />
          </div>

          {/* <div style={{ margin: "20px 0px" }}>
            <div style={{ fontSize: "12px", fontWeight: "1000" }}>
              DIAGNOSIS
            </div>
            <span>{bookingData.resultEnteredDetails.diagnosis}</span>
          </div> */}
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
              COMMENTS{" "}
            </div>
            <span>{bookingData.comments}</span>
          </div>

          {/* <div style={{ margin: "20px 0px" }}>
            <div style={{ fontSize: "12px", fontWeight: "1000" }}>
              MICROSCOPIC FINDINGS
            </div>
            <span>
              {bookingData.resultEnteredDetails.microscopicDescription} -
            </span>
          </div> */}
          <div style={{ margin: "20px 0px" }}>
            <div style={{ fontSize: "12px", fontWeight: "1000" }}>
              MICROSCOPIC FINDINGS
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html: bookingData.resultEnteredDetails.microscopicDescription,
              }}
            />
          </div>

          {/* <div style={{ margin: "20px 0px" }}>
            <div style={{ fontSize: "12px", fontWeight: "1000" }}>
              GROSS FINDINGS
            </div>
            <span>{bookingData.grossDescription}</span>
          </div> */}
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
              LIST of SECTIONS{" "}
            </div>
            {bookingData?.listOfSectionsDetails.map((i) => {
              return (
                <ul>
                  <li>
                    <b>
                      <span>{i.prefix + " " + i.name}</span> :{" "}
                      <span>{i.description}</span>
                    </b>
                  </li>
                </ul>
              );
            })}
          </div>
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

  const handleShare = useReactToPrint({
    content: () => contentToPrint.current,
    documentTitle: `${bookingData.serialNumber}.pdf`,
    copyStyles: true,
    print: async (printIframe) => {
      const document = printIframe.contentDocument;
      if (document) {
        const html = document.getElementsByTagName("html")[0];
        console.log(html);
        await html2pdf().from(html).save();
      }
    },
  });
const handleDownload = useReactToPrint({
  onPrintError: (error) => console.log(error),
  content: () => contentToPrint.current,
  removeAfterPrint: true,
  print: async (printIframe) => {
    const document = printIframe.contentDocument;
    if (document) {
      const html = document.getElementsByTagName("html")[0];
      console.log(html);
      const exporter = new html2pdf();
      await exporter.from(html).save();
    }
  },
});

var opt = {
  pagebreak: { mode: "avoid-all" },
  //   pagebreak: { mode: "legacy" },
  margin: [2, 0.1],
  filename: `${bookingData.serialNumber} - ${bookingData.patientName}`,
  image: { type: "png", quality: 1 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
};


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
            <Button
              variant="contained"
              onClick={() => {
                handlePrint(null, () => contentToPrint.current);
              }}
              style={{ padding: "10px 20px" }}
            >
              Generate Report
              {isLoading && <CircularProgress size="small" />}
            </Button>
            {/* <Button
              variant="contained"
              onClick={() => {
                // handleShare(null, () => contentToPrint.current);
                handleShare();
                // handleRTPdf();
                // html2pdf(document.getElementById("print-element"));
                
                // handleDownload();
                
                // html2pdf()
                //   .set(opt)
                //   .from(document.getElementById("print-element"))
                //   .save();

              }}
              style={{ padding: "10px 20px" }}
            >
              share PDF
              {isLoading && <CircularProgress size="small" />}
            </Button> */}
          </div>
        </div>
      ) : (
        <CircularProgress />
      )}
    </div>
  );
}

export default MyBookings;
