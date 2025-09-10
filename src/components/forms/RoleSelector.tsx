import { View, Text, Pressable, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { User } from "@/models/User";
import { Feather } from "@expo/vector-icons";
import { theme } from "@/theme/theme";

type Props = {
  onChange: (role: User["role"]) => void;
};

export default function RoleSelector({ onChange }: Props) {
  const [role, setRole] = useState<User["role"]>("client");

  useEffect(() => onChange(role), [role]);

  return (
    <View style={styles.roleButtonContainer}>
      <Pressable
        style={[styles.roleButton, role === "client" && styles.selectedButton]}
        onPress={() => setRole("client")}
      >
        <Feather
          name="user"
          size={20}
          color={
            role === "client"
              ? theme.colors.primaryBlue
              : theme.colors.lightGray
          }
          style={{ marginRight: 8 }}
        />
        <Text
          style={[
            styles.roleButtonText,
            role === "client" && styles.selectedText,
          ]}
        >
          Cliente
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.roleButton,
          role === "provider" && styles.selectedButton,
        ]}
        onPress={() => setRole("provider")}
      >
        <Feather
          name="briefcase"
          size={20}
          color={
            role === "provider"
              ? theme.colors.primaryBlue
              : theme.colors.lightGray
          }
          style={{ marginRight: 8 }}
        />
        <Text
          style={[
            styles.roleButtonText,
            role === "provider" && styles.selectedText,
          ]}
        >
          Profesional
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  roleButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 10,
  },
  roleButton: {
    flex: 1,
    borderRadius: 12,
    marginHorizontal: 5,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.darkGray,
    justifyContent: "center",
    alignItems: "center",
  },
  roleButtonText: {
    color: theme.colors.lightGray,
    fontSize: 17,
    fontFamily: theme.fontFamily.regular,
  },
  selectedButton: {
    backgroundColor: theme.colors.darkerGray,
    borderColor: theme.colors.primaryBlue,
  },
  selectedText: {
    color: theme.colors.primaryBlue,
    fontFamily: theme.fontFamily.bold,
  },
});
