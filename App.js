import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/screens/HomeScreen";
import AddHabitScreen from "./src/screens/AddHabitScreen";
import EditHabitScreen from "./src/screens/EditHabitScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Green Habits" }} />
        <Stack.Screen name="AddHabit" component={AddHabitScreen} options={{ title: "Add Habit" }} />
        <Stack.Screen name="EditHabit" component={EditHabitScreen} options={{ title: "Edit Habit" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
