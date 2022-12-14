import { MuiOtpInput } from "mui-one-time-password-input";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { TextField } from "@mui/material";
import Swal from "sweetalert2";
import { EmailStage } from "./EmailStage";
import { SignUpModel } from "../models/signUpModel";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const MobileStage = (props: any) => {
  const [emailStage, setEmailStage] = useState(false);
  const nationalImage = props.nationalImage;
  const studentImage = props.studentImage;
  const photos = props.photos;
  const app = initializeApp(firebaseConfig);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const ourUser: SignUpModel = props.user;

  const auth = getAuth();
  auth.languageCode = "ar";
  const [otp, setOtp] = useState("");
  const [clicked, setClicked] = useState(false);
  const handleChange = (newValue: string) => {
    setOtp(newValue);
  };
  let appVerifier: RecaptchaVerifier;

  const onSignInSubmit = () => {
    if (!phoneNumber) {
      Swal.fire({
        icon: "error",
        text: "برجاء ادخال رقم هاتفك",
      });
      return;
    }
    let number = `+2${phoneNumber}`;
    appVerifier = new RecaptchaVerifier("recaptcha-container", {}, auth);

    // const appVerifier = window.recaptchaVerifier;

    if (auth && appVerifier && number) {
      signInWithPhoneNumber(auth, number, appVerifier)
        .then((confirmationResult: any) => {
          // SMS sent. Prompt user to type the code from the message, then sign the
          // user in with confirmationResult.confirm(code).
          setConfirmationResult(confirmationResult);
          setClicked(true);

          Swal.fire({
            position: "center",
            icon: "success",
            title:
              "تم ارسال رمز تحقق مكون من 6 أرقام علي الرقم الذي قمت بادخاله بنجاح",
            showConfirmButton: false,
          });
          // ...
        })
        .catch((error: any) => {
          console.log(error.message);
          // Error; SMS not sent
          // ...
          Swal.fire({
            icon: "error",
            text: "حدث خطأ ما اثناء ارسال رمز التحقق برجاء المحاوله مره اخري بعد قليل",
            timer: 1500,
          });
          window.location.reload();
        });
    } else {
      Swal.fire({
        icon: "error",
        text: "حدث خطأ ما اثناء ارسال رمز التحقق برجاء المحاوله مره اخري بعد قليل",
        timer: 1500,
      });
      window.location.reload();
    }
  };
  return (
    <div>
      {!emailStage && (
        <>
          <div className="flex flex-col items-center justify-between">
            <h1 className="mb-8 text-2xl font-bold text-center">
              تأكيد رقم الموبايل
            </h1>
            <TextField
              id="outlined-basic"
              label="قم بادخال رقم الموبايل"
              variant="outlined"
              style={{
                width: "100%",
                textAlign: "right",
                justifyContent: "flex-end",
                fontSize: "1.2rem",
                marginTop: "1.5rem",
              }}
              onChange={(e) => setPhoneNumber(e.target.value)}
              value={phoneNumber}
              error={phoneNumber.length != 11}
              helperText={
                phoneNumber.length != 11
                  ? "يجب أن يتكون رقم الهاتف من 11 رقم "
                  : ""
              }
            />
            <div id="recaptcha-container" className="my-4"></div>

            {!clicked && (
              <>
                <Button
                  variant="contained"
                  id="sign-in-button"
                  onClick={onSignInSubmit}
                  sx={{ marginBottom: "1rem", borderRadius: "0.5rem" }}
                >
                  ارسال رمز التحقق
                </Button>
              </>
            )}
          </div>
          <div className="flex flex-col items-center justify-between mt-8">
            <label className="mb-5 text-sm text-gray-500">
              قم بادخال رمز التحقق الذي تم استلامه{" "}
            </label>
            <MuiOtpInput
              value={otp}
              onChange={handleChange}
              length={6}
              sx={{
                zoom: 0.9,
                width: "100%",
                textAlign: "center",
                justifyContent: "center",
                marginBottom: "2rem",

                "& input": {
                  fontSize: "0.8rem",
                  width: "0.5rem",
                  height: "0.5rem",
                },
              }}
            />

            <Button
              variant="contained"
              sx={{ marginBottom: "1rem", borderRadius: "0.5rem" }}
              onClick={() => {
                confirmationResult
                  .confirm(otp)
                  .then((result: { user: any }) => {
                    // User signed in successfully.
                    const user = result.user;
                    // ...
                    console.log(user);
                    Swal.fire({
                      position: "center",
                      icon: "success",
                      title: "تم تأكيد رقم الموبايل بنجاح",
                      showConfirmButton: false,
                      timer: 1500,
                    });
                    setEmailStage(true);
                    ourUser.mobileNumber = phoneNumber;
                  })
                  .catch((error: any) => {
                    // User couldn't sign in (bad verification code?)
                    // ...
                    console.log(error);
                  });
              }}
            >
              تأكيد
            </Button>
          </div>
        </>
      )}
      {emailStage && (
        <div>
          <EmailStage
            nationalImage={nationalImage}
            studentImage={studentImage}
            user={ourUser}
            photos={photos}
          />
        </div>
      )}
    </div>
  );
};
