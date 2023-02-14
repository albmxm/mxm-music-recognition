import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import { View, Text, StyleSheet } from "react-native";

import { RootStackParamList } from "./types";

export const Detail = ({
  navigation,
  route: {
    params: { title, album, artist },
  },
}: NativeStackScreenProps<RootStackParamList, "Detail">) => {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
      <Text>{album}</Text>
      <Text>{artist}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: 200,
    backgroundColor: "blue",
    color: "white",
  },
});
