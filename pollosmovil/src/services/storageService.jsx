import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveTokens = async (accessToken, refreshToken) => {
  await AsyncStorage.multiSet([
    ['accessToken', accessToken],
    ['refreshToken', refreshToken],
  ]);
};

export const getAccessToken = async () => {
  return await AsyncStorage.getItem('accessToken');
};

export const getRefreshToken = async () => {
  return await AsyncStorage.getItem('refreshToken');
};

export const clearTokens = async () => {
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
};
