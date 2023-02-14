import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Audio } from "expo-av";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { identify } from "../utils";

import { RootStackParamList } from "./types";

export const Home = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Home">) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const animValue = useRef(new Animated.Value(0)).current;

  const handleStartRecording = async () => {
    const response = await Audio.requestPermissionsAsync();

    if (!response.granted) {
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording, status } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
      (status) => console.log(status),
      500
    );

    setRecording(recording);
  };

  const handleStopRecording = useCallback(async () => {
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording?.getURI();

    setRecording(null);

    if (uri) {
      const result = await identify(uri);

      const musicInfo = result.metadata.music[0];

      navigation.push("Detail", {
        title: musicInfo.title,
        album: musicInfo.album.name,
        artist: musicInfo.artists[0].name,
      });
    }
  }, [navigation, recording]);

  useEffect(() => {
    if (recording) {
      setTimeout(() => {
        handleStopRecording();
      }, 5000);
    }
  }, [recording, handleStopRecording]);

  const buttonSize = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(buttonSize.value, {
            stiffness: 1000,
            damping: 50,
          }),
        },
      ],
    };
  });

  const circleSize = useSharedValue(0);
  const circleStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.8 - circleSize.value,
      transform: [
        {
          scale: interpolate(circleSize.value, [0, 1], [1, 4]),
        },
      ],
    };
  });

  useEffect(() => {
    if (!recording) {
      circleSize.value = 0;
    }
  }, [recording, circleSize]);

  return (
    <View style={styles.container}>
      {recording ? (
        <Animated.View style={[circleStyle, styles.animatedCircle]} />
      ) : null}
      <Animated.View style={buttonStyle}>
        <Pressable
          onPressIn={() => {
            buttonSize.value = 0.9;
            circleSize.value = withRepeat(
              withTiming(1, { duration: 1000 }),
              -1,
              false
            );
          }}
          onPressOut={() => {
            buttonSize.value = 1;
          }}
          onPress={handleStartRecording}
        >
          <Image
            style={styles.image}
            source={require("../../../assets/logo_mxm.png")}
          />
        </Pressable>
      </Animated.View>
      <StatusBar style="auto" />
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
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  animatedCircle: {
    position: "absolute",
    width: 120,
    height: 120,
    backgroundColor: "red",
    borderRadius: 999,
  },
  image: {
    width: 120,
    height: 120,
  },
});
