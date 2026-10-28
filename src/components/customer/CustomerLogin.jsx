import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
} from "@mui/material";

import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import BackspaceRoundedIcon from "@mui/icons-material/BackspaceRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";

import { loginCustomer } from "../../services/customerService";
import { continueAsGuest } from "../../services/guestService";
import { isValidSriLankanMobileNumber } from "../../utils/validation";
import lockscreenBg from "../../assets/lockscreen-bg.jpg";

export default function CustomerLogin() {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addNumber = (num) => {
    if (mobile.length < 10) {
      setMobile((prev) => prev + num);
      if (error) setError("");
    }
  };

  const backspace = () => {
    setMobile((prev) => prev.slice(0, -1));
    if (error) setError("");
  };

  const clear = () => {
    setMobile("");
    if (error) setError("");
  };

  const handleContinue = async () => {
    if (!mobile) {
      setError("Phone number is required.");
      return;
    }
    if (!isValidSriLankanMobileNumber(mobile)) {
      setError("Please enter a valid 10-digit phone number (e.g. 07xxxxxxxx).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await loginCustomer(mobile);
      const data = response.data;

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("customerId", data.customerId);
      localStorage.setItem("customerName", data.customerName || "Customer");
      localStorage.setItem("userName", data.customerName || "Customer");
      localStorage.setItem("customerPhone", data.customerPhone || mobile);
      localStorage.setItem("userRole", "CUSTOMER");

      navigate("/menu");
    } catch (err) {
      console.error("Login error:", err);
      const errMsg =
        err.response?.data?.error ||
        "Login failed. Please register if you do not have an account.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const saveSession = (data) => {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("customerId", data.customerId);
    localStorage.setItem("customerName", data.customerName);
    localStorage.setItem("userRole", data.role || "CUSTOMER");
    
    if (data.customerPhone) localStorage.setItem("customerPhone", data.customerPhone);
    else localStorage.removeItem("customerPhone");
  };

  const handleGuest = async () => {
    try {
      setLoading(true);
      const response = await continueAsGuest();
      saveSession(response.data);
      navigate('/menu');
    } catch (err) {
      console.error('Guest login failed:', err);
      navigate('/menu');
    } finally {
      setLoading(false);
    }
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"];

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        backgroundImage: `linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,.65)), url(${lockscreenBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Paper
          elevation={0}
          sx={{
            width: 520,
            borderRadius: 6,
            p: 5,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,.12)",
            boxShadow: "0 20px 50px rgba(0,0,0,.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
        {/* Taste Trek Brand Logo */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          {/* <RestaurantMenuRoundedIcon
            sx={{
              fontSize: 50,
              color: "#ff7a00",
              mb: 0.5,
            }}
          /> */}
          <Typography
            variant="h3" 
            className="font-extrabold tracking-wider bg-gradient-to-r from-[#FF3131] to-[#FF914D] bg-clip-text text-transparent mb-2"
            sx={{ fontWeight: 900 }}
          >
            TASTE TREK
          </Typography>
        </Box>

        <Typography
          sx={{
            color: "#d6d6d6",
            fontSize: 18,
            mb: error ? 2 : 4,
            textAlign: "center",
          }}
        >
          Enter your mobile number
        </Typography>

        {/* Error Message Display */}
        {error && (
          <Box
            sx={{
              width: "100%",
              mb: 4,
              p: 2,
              background: "rgba(244, 67, 54, 0.1)",
              border: "1px solid rgba(244, 67, 54, 0.3)",
              borderRadius: 2,
            }}
          >
            <Typography
              sx={{
                color: "#ff4d4d",
                fontSize: 14,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {error}
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          value={mobile}
          placeholder="07XXXXXXXX"
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <PhoneRoundedIcon sx={{ color: "#ff7a00" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 4,
            "& .MuiOutlinedInput-root": {
              height: 78,
              borderRadius: 4,
              background: "rgba(255,255,255,.08)",
              color: "white",
              fontSize: 30,
              letterSpacing: 3,
            },
            "& input::placeholder": {
              color: "#cfcfcf",
              opacity: 1,
            },
            "& fieldset": {
              borderColor: "rgba(255,255,255,.15)",
            },
          }}
        />

        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 2,
          }}
        >
          {keys.map((key) => (
            <Button
              key={key}
              disabled={loading}
              onClick={() => {
                if (key === "C") clear();
                else if (key === "⌫") backspace();
                else addNumber(key);
              }}
              sx={{
                height: 85,
                borderRadius: 4,
                fontSize: key === "⌫" ? 24 : 30,
                fontWeight: "bold",
                color: "white",
                textTransform: "none",
                background:
                  key === "C"
                    ? "#E53935"
                    : key === "⌫"
                    ? "#2d3436"
                    : "rgba(255,255,255,.10)",
                backdropFilter: "blur(12px)",
                "&:hover": {
                  background:
                    key === "C"
                      ? "#d32f2f"
                      : key === "⌫"
                      ? "#444"
                      : "#ff7a00",
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 25px rgba(255,122,0,.35)",
                },
                transition: ".25s",
                "&.Mui-disabled": {
                  color: "rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,.05)",
                },
              }}
            >
              {key === "⌫" ? <BackspaceRoundedIcon /> : key}
            </Button>
          ))}
        </Box>



        {/* Navigation Switch Option */}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography sx={{ color: "#cfcfcf", fontSize: 14 }}>
            Don't have an account?{" "}
            <Box
              component="span"
              onClick={() => {
                if (!loading) navigate("/CustomerRegister");
              }}
              sx={{
                color: "#ff9800",
                fontWeight: 600,
                cursor: loading ? "default" : "pointer",
                "&:hover": {
                  textDecoration: loading ? "none" : "underline",
                },
              }}
            >
              Sign up here
            </Box>
          </Typography>
        </Box>
      </Paper>

      {/* Action Buttons Container */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: 350 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleContinue}
          disabled={loading}
          sx={{
            height: 75,
            borderRadius: 4,
            fontSize: 22,
            fontWeight: "bold",
            letterSpacing: 1,
            background: "linear-gradient(90deg,#ff6b00,#ff9800)",
            boxShadow: "0 10px 30px rgba(255,107,0,.45)",
            "&:hover": {
              background: "linear-gradient(90deg,#ff7a00,#ffb300)",
              transform: "scale(1.02)",
            },
            transition: ".25s",
            "&.Mui-disabled": {
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={32} sx={{ color: "#ffffff" }} />
          ) : (
            "CONTINUE"
          )}
        </Button>

        <Button
          fullWidth
          variant="contained"
          onClick={handleGuest}
          disabled={loading}
          sx={{
            height: 75,
            borderRadius: 4,
            fontSize: 18,
            fontWeight: "bold",
            letterSpacing: 1,
            background: "linear-gradient(90deg,#0d9488,#0f766e)",
            boxShadow: "0 10px 30px rgba(13,148,136,.45)",
            "&:hover": {
              background: "linear-gradient(90deg,#14b8a6,#0d9488)",
              transform: "scale(1.02)",
            },
            transition: ".25s",
            "&.Mui-disabled": {
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={32} sx={{ color: "#ffffff" }} />
          ) : (
            "CONTINUE WITHOUT LOGIN"
          )}
        </Button>
      </Box>
    </Box>
  </Box>
  );
}