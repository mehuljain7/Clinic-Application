import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

// Import all screens
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import NewDiagnosisScreen from "./screens/NewDiagnosisScreen";
import DiagnosisResultScreen from "./screens/DiagnosisResultScreen";  // ✅ Added
import ReportsListScreen from "./screens/ReportsListScreen";
import ReportDetailScreen from "./screens/ReportDetailScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem("user");
      setInitialRoute(user ? "Home" : "Login");
    };
    checkUser();
  }, []);

  if (!initialRoute) return null; // Prevent flicker before knowing the route

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
          {/* Auth Screens */}
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          
          {/* Main App Screens */}
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="NewDiagnosis" 
            component={NewDiagnosisScreen} 
            options={{ 
              headerShown: true,
              title: "New Diagnosis",
              headerBackTitle: "Back"
            }} 
          />
          
          {/* ✅ Added DiagnosisResult screen */}
          <Stack.Screen 
            name="DiagnosisResult" 
            component={DiagnosisResultScreen} 
            options={{ 
              headerShown: true,
              title: "Diagnosis Results",
              headerBackTitle: "Back"
            }} 
          />
          
          {/* Reports Screens */}
          <Stack.Screen 
            name="ReportsList" 
            component={ReportsListScreen} 
            options={{ 
              headerShown: true,
              title: "My Reports",
              headerBackTitle: "Back"
            }} 
          />
          <Stack.Screen 
            name="ReportDetail" 
            component={ReportDetailScreen} 
            options={{ 
              headerShown: true,
              title: "Report Details",
              headerBackTitle: "Back"
            }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}