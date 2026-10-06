export const Accuracy = { BestForNavigation: 6, Balanced: 3 };
export const requestForegroundPermissionsAsync = async () => ({ status: "denied", granted: false });
export const getForegroundPermissionsAsync = async () => ({ status: "denied", granted: false });
export const hasServicesEnabledAsync = async () => false;
export const hasStartedLocationUpdatesAsync = async () => false;
export const startLocationUpdatesAsync = async () => {}; export const stopLocationUpdatesAsync = async () => {};
export const getLastKnownPositionAsync = async () => null; export const getCurrentPositionAsync = async () => null;
