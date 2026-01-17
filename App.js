import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DashboardScreen from "./src/screens/DashboardScreen";
import StatsScreen from "./src/screens/StatsScreen";
import AddHabitScreen from "./src/screens/AddHabitScreen";
import EditHabitScreen from "./src/screens/EditHabitScreen";
import { THEME } from "./theme";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: THEME.text,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: THEME.bg },
          headerTitleStyle: { fontWeight: "900" },
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Statistics" component={StatsScreen}  />
        <Stack.Screen name="AddHabit" component={AddHabitScreen}  />
        <Stack.Screen name="EditHabit" component={EditHabitScreen}  />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
