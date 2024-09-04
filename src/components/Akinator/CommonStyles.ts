const commonStyles = {
  container: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1d3557",
    color: "#f4a261",
    height: "calc(100vh - 60px)",
  },
  header: {
    width: "100%",
    textAlign: "center" as "center",
    backgroundColor: "#1d3557",
    padding: "10px 0",
  },
  title: {
    fontSize: "2.5em",
    margin: "0",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 1000,
    fontStyle: "italic",
  },
  main: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    backgroundColor: "#F9ECCB",
    padding: "20px",
    borderRadius: "10px",
    height: "800px",
    maxHeight: "700px",
    width: "80%",
    overflowY: "auto" as const,
  },
  questionContainer: {
    textAlign: "center" as "center",
    marginBottom: "20px",
  },
  question: {
    fontSize: "1.5em",
    margin: "0",
    color: "#000",
  },
  subQuestion: {
    fontSize: "1em",
    margin: "0",
    color: "#000",
  },
  optionsContainer: {
    display: "flex",
    flexDirection: "column" as "column",
    width: "100%",
    alignItems: "center",
  },
  optionButton: { 
    width: "80%",
    padding: "10px 0",
    margin: "10px 0",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1em",
    color: "#000",
  },
  submitButton: {
    color: "#1d3557",
    border: "none",
    padding: "10px 20px",
    margin: "20px 0 0 0",
    fontSize: "1em",
    borderRadius: "5px",
  },
  checkmark: {
    fontSize: "4em",
    color: "#f4a261",
  },
  akinatorImage: {
    display: "block",       // ブロック要素にする
    margin: "0 auto",   
    width: "80%",
    maxWidth: "300px",
    height: "auto",
  },
};

export default commonStyles;
