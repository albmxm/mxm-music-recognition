import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

import { RootStackParamList } from "./types";

export const Detail = ({
  navigation,
  route: {
    params: { title, album, artist },
  },
}: NativeStackScreenProps<RootStackParamList, "Detail">) => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require("../../../assets/album_test.jpg")}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.album}>{album}</Text>
      <Text style={styles.artist}>{artist}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
  },
  image: {
    height: undefined,
    width: "100%",
    aspectRatio: 1,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 8,
  },
  album: { fontSize: 18, color: "grey" },
  artist: { fontSize: 18 },
});
