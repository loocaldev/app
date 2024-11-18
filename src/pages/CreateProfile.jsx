import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.svg";
import AddressForm from "../components/Forms/AddressForm.jsx";
import styles from "../styles/CreateProfile.module.css";
import { indicativos } from "../data/indicativos";
import { departamentosYMunicipios } from "../data/departamentosYMunicipios";

function CreateProfile() {
  const { updateUser, sendVerificationCode, verifyCode, addAddress } =
    useAuth();
  const [step, setStep] = useState(1); // Paso actual
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(30);

  const navigate = useNavigate();
  const inputsRef = useRef([]);

  // Estados
  const [personalInfo, setPersonalInfo] = useState({
    firstname: "",
    lastname: "",
    documentType: "CC",
    documentNumber: "",
    birthdate: "",
    phone: "",
    phoneCode: "+57",
  });

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false); // Estado para controlar si se ha enviado el OTP
  const [isOtpValid, setIsOtpValid] = useState(false);
  const [addressInfo, setAddressInfo] = useState({
    departament: "",
    town: "",
    address: "",
    detalle: "",
  });

  // Manejadores de cambios en formularios
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });
  };

  const handleDepartamentoChange = (e) => {
    const { value } = e.target;
    setAddressInfo((prev) => ({ ...prev, departament: value, town: "" }));
  };

  const handleMunicipioChange = (e) => {
    const { value } = e.target;
    setAddressInfo((prev) => ({ ...prev, town: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Solo números
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    // Si se han completado los 4 dígitos, envía la verificación
    if (newOtp.join("").length === 4) {
      handleSubmitOtpVerification(newOtp.join(""));
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      newOtp.forEach((digit, index) => {
        if (inputsRef.current[index]) {
          inputsRef.current[index].value = digit;
        }
      });

      // Verifica automáticamente si se pega un código completo
      if (pastedData.length === 4) {
        handleSubmitOtpVerification(pastedData);
      }
    }
  };
  // Temporizador para reenviar OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Validaciones y envíos
  const handleSendOtp = async () => {
    setLoading(true);
    setErrorMessages({});
    try {
      // Guardar número de teléfono y código de país en la base de datos
      await updateUser({
        profile: {
          phone_code: personalInfo.phoneCode,
          phone_number: personalInfo.phone,
        },
      });

      // Enviar el OTP al número proporcionado
      await sendVerificationCode(
        `${personalInfo.phoneCode}${personalInfo.phone}`
      );
      setOtpSent(true);
      setResendTimer(30); // Reinicia el temporizador
    } catch (error) {
      setErrorMessages({ step2: "Error al enviar código de verificación." });
    } finally {
      setLoading(false);
    }
  };

  // Validaciones y envíos
  const handleSubmitPersonalInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessages({});
    try {
      await updateUser({
        first_name: personalInfo.firstname,
        last_name: personalInfo.lastname,
        profile: {
          document_type: personalInfo.documentType,
          document_number: personalInfo.documentNumber,
          birthdate: personalInfo.birthdate,
        },
      });
      setStep(2); // Siguiente paso
    } catch (error) {
      setErrorMessages({ step1: "Error al guardar datos personales." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOtpVerification = async (otpCode) => {
    setLoading(true);
    setErrorMessages({});
    try {
      // Verificar el OTP
      const result = await verifyCode(
        `${personalInfo.phoneCode}${personalInfo.phone}`,
        otpCode
      );

      if (result.success) {
        // Actualizar isPhoneVerified en el backend
        await updateUser({
          profile: { is_phone_verified: true },
        });

        setIsOtpValid(true);
        setTimeout(() => {
          setIsOtpValid(false);
          setStep(3); // Avanza al siguiente paso
        }, 2000); // Retraso para mostrar mensaje de éxito
      } else {
        setErrorMessages({ step2: "Código incorrecto o expirado." });
      }
    } catch (error) {
      setErrorMessages({ step2: "Error al verificar el código." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessages({});
    try {
      await addAddress({
        street: addressInfo.address,
        city: addressInfo.town,
        state: addressInfo.departament,
        postal_code: "110111",
        country: "Colombia",
        is_default: true,
      });
      setStep(4); // Cambia a la pantalla de bienvenida
    } catch (error) {
      setErrorMessages({ step3: "Error al guardar dirección." });
    } finally {
      setLoading(false);
    }
  };

  // Renderización por pasos
  return (
    <div className={styles.Container}>
      <div className={styles.Stepper}>
        {/* Indicador de pasos */}
        <div className={styles.ProgressBar}>
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className={`${styles.ProgressBarSegment} ${
                i < step ? styles.Active : ""
              }`}
            />
          ))}
        </div>
        <img src={Logo} alt="Logo" />
        {successMessage && <p className={styles.Success}>{successMessage}</p>}

        {step === 1 && (
          <>
            <h3>Cuéntanos más de ti</h3>
            <form onSubmit={handleSubmitPersonalInfo}>
              <div className={styles.FormRow}>
                <div className={styles.InputGroup}>
                  <label>Nombre</label>
                  <input
                    type="text"
                    name="firstname"
                    value={personalInfo.firstname}
                    onChange={handlePersonalInfoChange}
                    required
                  />
                </div>
                <div className={styles.InputGroup}>
                  <label>Apellido</label>
                  <input
                    type="text"
                    name="lastname"
                    value={personalInfo.lastname}
                    onChange={handlePersonalInfoChange}
                    required
                  />
                </div>
              </div>
              <div className={styles.FormRow}>
                <div className={styles.InputGroup}>
                  <label>Fecha de nacimiento</label>
                  <input
                    type="date"
                    name="birthdate"
                    value={personalInfo.birthdate}
                    onChange={handlePersonalInfoChange}
                    required
                  />
                </div>
              </div>
              <div className={styles.FormRow}>
                <div className={styles.InputGroup}>
                  <label>Número de documento</label>
                  <div className="form-multi-input">
                    <select
                      name="documentType"
                      value={personalInfo.documentType}
                      onChange={handlePersonalInfoChange}
                    >
                      <option value="CC">C.C.</option>
                      <option value="CE">C.E.</option>
                      <option value="PP">Pasaporte</option>
                    </select>
                    <input
                      type="text"
                      name="documentNumber"
                      value={personalInfo.documentNumber}
                      onChange={handlePersonalInfoChange}
                      required
                    />
                  </div>
                </div>
              </div>
              {errorMessages.step1 && (
                <p className={styles.Error}>{errorMessages.step1}</p>
              )}
              <button type="submit" disabled={loading}>
                {loading ? "Cargando..." : "Siguiente"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            {!otpSent ? (
              <>
                <h3>Tu número de celular</h3>
                <div className={styles.InputGroup}>
                  <div className={styles.PhoneInput}>
                    <div className="form-multi-input">
                      <select
                        name="phoneCode"
                        value={personalInfo.phoneCode}
                        onChange={handlePersonalInfoChange}
                      >
                        {indicativos.map(({ code, abbreviation }) => (
                          <option key={code + abbreviation} value={code}>
                            {code} ({abbreviation})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="phone"
                        value={personalInfo.phone}
                        onChange={handlePersonalInfoChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.FormButtons}>
                  <button onClick={() => setStep(1)}>Volver</button>
                  <button onClick={handleSendOtp} disabled={loading}>
                    {loading ? "Cargando..." : "Continuar"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>
                  Ingresa el código enviado a{" "}
                  {`${personalInfo.phoneCode}${personalInfo.phone}`}
                </p>
                <div className={styles.OtpContainer}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onPaste={handleOtpPaste}
                      ref={(el) => (inputsRef.current[index] = el)}
                      className={`${styles.OtpInput} ${
                        isOtpValid ? styles.Valid : ""
                      }`}
                    />
                  ))}
                </div>
                {isOtpValid && (
                  <p className={`${styles.SuccessMessage}`}>
                    ¡Código verificado correctamente!
                  </p>
                )}
                {errorMessages.step2 && (
                  <p className={styles.Error}>{errorMessages.step2}</p>
                )}
                <div className={styles.ReturnToPhone}>
                  <button onClick={() => setOtpSent(false)}>
                    Corregir número
                  </button>
                </div>
                <div className={styles.ResendOTP}>
                  <button
                    className={`${styles.ResendButton} ${
                      resendTimer > 0 ? styles.Disabled : styles.Enabled
                    }`}
                    onClick={handleSendOtp}
                    disabled={resendTimer > 0 || loading}
                  >
                    {resendTimer > 0
                      ? `Reenviar código en ${resendTimer}s`
                      : "¿No recibiste el código? Volver a enviar"}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h3>Dirección de Entrega</h3>
            <AddressForm
              formData={addressInfo}
              onDepartamentoChange={handleDepartamentoChange}
              onMunicipioChange={handleMunicipioChange}
              onAddressChange={handleAddressChange}
            />
            {errorMessages.step3 && (
              <p className={styles.Error}>{errorMessages.step3}</p>
            )}
            <button onClick={handleSubmitAddress} disabled={loading}>
              {loading ? "Guardando..." : "Finalizar"}
            </button>
          </>
        )}
        {step === 4 && (
          <div className={styles.Welcome}>
            <h2>¡Bienvenido, {personalInfo.firstname}!</h2>
            <p>
              Nos alegra tenerte en nuestra plataforma. Ahora puedes explorar
              todos los beneficios.
            </p>
            <button
              className={styles.PrimaryButton}
              onClick={() => {
                window.location.href = "/explorar";
              }}
            >
              Ir a Explorar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateProfile;
