import Reactotron from 'reactotron-react-native';
import { networking, trackGlobalErrors, trackGlobalLogs } from 'reactotron-react-native';
import Constants from 'expo-constants';

const host =
  Constants.expoConfig?.hostUri?.split(':').shift() ||
  (Constants as any)?.manifest2?.extra?.expoClient?.hostUri?.split(':').shift() ||
  'localhost';



const tron = Reactotron.configure({
  name: 'FASTMAN Mobile',
  host,
})

  .use(trackGlobalLogs())
  .use(trackGlobalErrors())
  .use(networking())
  .connect();

Reactotron.clear?.();

declare global {
  interface Console {
    tron?: typeof tron;
  }
}
console.tron = tron;

export default tron;
