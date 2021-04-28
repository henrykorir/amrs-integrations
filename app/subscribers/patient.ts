import ADTRESTClient from "../loaders/ADT-rest-client";
import PatientService from "../services/patient";
import { EventSubscriber, On } from "event-dispatch";
import { HTTPResponse } from "../interfaces/response";
@EventSubscriber()
export default class PatientSubscriber {
  @On("search")
  public onPatientSearch({ patient, MFLCode }: any) {
    console.log("Search event has reached here", MFLCode);
    const data = new ADTRESTClient();
    const patientService = new PatientService();
    data.axios
      .get("/patients/" + patient.patient_number_ccc, {
        params: {
          mflcode: MFLCode,
          identifier: "ccc",
          ccc: patient,
        },
      })
      .then(async (resp: any) => {
        let result: Patient.Patient[] = resp;
        if (result[0]?.patient_number_ccc) {
          await patientService.createPatientPrescriptionOnADT(result[0]);
        } else {
          await patientService.createPatientOnADT(patient, MFLCode);
        }
      })
      .catch(
        (error: {
          response: { data: any; status: any; headers: any };
          request: any;
          message: any;
          config: any;
        }) => {
          // Error 😨
          if (error.response) {
            /*
             * The request was made and the server responded with a
             * status code that falls out of the range of 2xx
             */
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            /*
             * The request was made but no response was received, `error.request`
             * is an instance of XMLHttpRequest in the browser and an instance
             * of http.ClientRequest in Node.js
             */
            console.log(error.request);
          } else {
            // Something happened in setting up the request and triggered an Error
            console.log("Error", error.message);
          }
          console.log(error.config);
        }
      );
  }
  @On("createPatient")
  public onPatientCreate({ patient, mflcode }: any) {
    let patients: Patient.Patient = patient[0];

    let payload = {
      source: "PMTCT",
      medical_record_no: patients.medical_record_no,
      patient_number_ccc: patients.patient_ccc_number.replace("-", ""),
      first_name: patients.first_name,
      last_name: patients.last_name,
      other_name: patients.other_name,
      date_of_birth: patients.other_name,
      place_of_birth: patients.place_of_birth,
      gender: patients.gender,
      pregnant: patients.gender ? patients.gender : "",
      breastfeeding: patients.breastfeeding ? patients.breastfeeding : "",
      weight: patients.weight,
      height: patients.height,
      start_regimen: "PM8",
      start_regimen_date: patients.start_regimen_date,
      enrollment_date: patients.enrollment_date,
      phone: patients.phone,
      address: patients.address,
      partner_status: "Unknown",
      family_planning: patients.family_planning ? patients.family_planning : "",
      alcohol: patients.alcohol ? patients.alcohol : "",
      smoke: patients.smoke ? patients.smoke : "",
      current_status: 1,
      service: 5,
      mfl_code: mflcode,
    };
    const data = new ADTRESTClient();
    data.axios
      .post("/patient", payload)
      .then(async (resp: HTTPResponse) => {
        console.log(resp.message);
        if (resp.code !== 200) {
          //Publish event with payload and error that occurred
        }
      })
      .catch(
        (error: {
          response: { data: any; status: any; headers: any };
          request: any;
          message: any;
          config: any;
        }) => {
          // Error 😨
          if (error.response) {
            /*
             * The request was made and the server responded with a
             * status code that falls out of the range of 2xx
             */
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            /*
             * The request was made but no response was received, `error.request`
             * is an instance of XMLHttpRequest in the browser and an instance
             * of http.ClientRequest in Node.js
             */
            console.log(error.request);
          } else {
            // Something happened in setting up the request and triggered an Error
            console.log("Error", error.message);
          }
          console.log(error.config);
        }
      );
  }
}