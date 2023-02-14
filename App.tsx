import Base64 from "crypto-js/enc-base64";
import hmacSHA1 from "crypto-js/hmac-sha1";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View, Button } from "react-native";

const defaultOptions = {
  host: "identify-global.acrcloud.com",
  endpoint: "/v1/identify",
  signature_version: "1",
  data_type: "audio",
  secure: true,
  access_key: "1f142ebb285ef8e0c0f19915916e1f84",
  access_secret: "Uydil8cdA1Onrf6wxmpdBJaKFE2iEhTGLL11QKT6",
};

const buildStringToSign = (
  method: string,
  uri: string,
  accessKey: string,
  dataType: string,
  signatureVersion: string,
  timestamp: number
) => {
  return [method, uri, accessKey, dataType, signatureVersion, timestamp].join(
    "\n"
  );
};

const signString = (stringToSign: string, accessSecret: string) => {
  return Base64.stringify(hmacSHA1(stringToSign, accessSecret));
};

const identify = async (uri: string, options: typeof defaultOptions) => {
  const currentDate = new Date();
  const timestamp = currentDate.getTime() / 1000;
  const stringToSign = buildStringToSign(
    "POST",
    options.endpoint,
    options.access_key,
    options.data_type,
    options.signature_version,
    timestamp
  );
  const fileinfo = await FileSystem.getInfoAsync(uri, { size: true });
  const signature = signString(stringToSign, options.access_secret);
  const formData: Record<string, any> = {
    sample: { uri, name: "sample.wav", type: "audio/wav" },
    access_key: options.access_key,
    data_type: options.data_type,
    signature_version: options.signature_version,
    signature,
    sample_bytes: fileinfo.size,
    timestamp,
  };
  const form = new FormData();

  for (const key in formData) {
    form.append(key, formData[key]);
  }

  const postOptions = {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    body: form,
  };

  console.log(postOptions.body);
  const response = await fetch(
    "http://" + options.host + options.endpoint,
    postOptions
  );
  const result = await response.text();

  console.log(result);

  return result;
};

export const App = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const handleStartRecording = async () => {
    const response = await Audio.requestPermissionsAsync();

    if (!response.granted) {
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recordOptions = {
      android: {
        extension: ".m4a",
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: ".wav",
        bitRate: 128000,
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 8000,
        numberOfChannels: 1,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: true,
      },
      // TODO: web
      web: {},
    };

    const { recording, status } = await Audio.Recording.createAsync(
      // recordOptions,
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
      const _ = await identify(uri, defaultOptions);

      // const sound = await recording?.createNewLoadedSoundAsync();
      // sound?.sound.playAsync();
    }
  }, [recording]);

  useEffect(() => {
    if (recording) {
      setTimeout(() => {
        handleStopRecording();
      }, 8000);
    }
  }, [recording, handleStopRecording]);

  return (
    <View style={styles.container}>
      <View style={styles.button}>
        <Button
          title={recording ? "Stop listening" : "Start listening"}
          onPress={recording ? handleStopRecording : handleStartRecording}
        />
      </View>
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
    width: 200,
    backgroundColor: "blue",
    color: "white",
  },
});

export default App;
