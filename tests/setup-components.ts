/* Component-test setup. Reanimated (pulled in by NativeWind's native runtime) ships a Jest
 * mock so components render without native worklets. */
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
