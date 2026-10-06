import React from "react"; import { View } from "react-native";
export const WebView = React.forwardRef((p, ref) => { React.useImperativeHandle(ref, () => ({ injectJavaScript() {} })); return React.createElement(View, { style: p.style }); });
export default WebView;
