import Base64 from "crypto-js/enc-base64";
import hmacSHA1 from "crypto-js/hmac-sha1";
import * as FileSystem from "expo-file-system";

const defaultOptions = {
  host: "identify-eu-west-1.acrcloud.com",
  endpoint: "/v1/identify",
  signature_version: "1",
  data_type: "audio",
  secure: true,
  access_key: "8470da3a0657421452c2f958dc29e034",
  access_secret: "9joYdvCqb1oq6iYCB5zbIVGaz49Q14h3Ecizwc0e",
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

export const identify = async (uri: string) => {
  const currentDate = new Date();
  const timestamp = currentDate.getTime() / 1000;
  const stringToSign = buildStringToSign(
    "POST",
    defaultOptions.endpoint,
    defaultOptions.access_key,
    defaultOptions.data_type,
    defaultOptions.signature_version,
    timestamp
  );
  const fileinfo = await FileSystem.getInfoAsync(uri, { size: true });
  const signature = signString(stringToSign, defaultOptions.access_secret);
  const formData: Record<string, any> = {
    sample: { uri, name: "sample.wav", type: "audio/wav" },
    access_key: defaultOptions.access_key,
    data_type: defaultOptions.data_type,
    signature_version: defaultOptions.signature_version,
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

  // console.log(postOptions.body);
  const response = await fetch(
    "http://" + defaultOptions.host + defaultOptions.endpoint,
    postOptions
  );
  const result = await response.text();

  // console.log(result);

  return JSON.parse(result);
};
