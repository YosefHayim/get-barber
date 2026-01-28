import { Platform } from 'react-native';
import {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  FadeOutDown,
  FadeOutUp,
  SlideInDown,
  SlideInUp,
  SlideInLeft,
  SlideInRight,
  SlideOutDown,
  SlideOutUp,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';

const isWeb = Platform.OS === 'web';

export const webSafeFadeIn = (duration = 400) =>
  isWeb ? undefined : FadeIn.duration(duration);

export const webSafeFadeInDown = (delay = 0, duration = 400) =>
  isWeb ? undefined : FadeInDown.delay(delay).duration(duration);

export const webSafeFadeInUp = (delay = 0, duration = 400) =>
  isWeb ? undefined : FadeInUp.delay(delay).duration(duration);

export const webSafeFadeInLeft = (delay = 0, duration = 400) =>
  isWeb ? undefined : FadeInLeft.delay(delay).duration(duration);

export const webSafeFadeInRight = (delay = 0, duration = 400) =>
  isWeb ? undefined : FadeInRight.delay(delay).duration(duration);

export const webSafeFadeOut = (duration = 400) =>
  isWeb ? undefined : FadeOut.duration(duration);

export const webSafeFadeOutDown = (delay = 0, duration = 400) =>
  isWeb ? undefined : FadeOutDown.delay(delay).duration(duration);

export const webSafeFadeOutUp = (delay = 0, duration = 400) =>
  isWeb ? undefined : FadeOutUp.delay(delay).duration(duration);

export const webSafeSlideInDown = (delay = 0, duration = 400) =>
  isWeb ? undefined : SlideInDown.delay(delay).duration(duration);

export const webSafeSlideInUp = (delay = 0, duration = 400) =>
  isWeb ? undefined : SlideInUp.delay(delay).duration(duration);

export const webSafeSlideInLeft = (delay = 0, duration = 400) =>
  isWeb ? undefined : SlideInLeft.delay(delay).duration(duration);

export const webSafeSlideInRight = (delay = 0, duration = 400) =>
  isWeb ? undefined : SlideInRight.delay(delay).duration(duration);

export const webSafeSlideOutDown = (delay = 0, duration = 400) =>
  isWeb ? undefined : SlideOutDown.delay(delay).duration(duration);

export const webSafeSlideOutUp = (delay = 0, duration = 400) =>
  isWeb ? undefined : SlideOutUp.delay(delay).duration(duration);

export const webSafeZoomIn = (delay = 0, duration = 400) =>
  isWeb ? undefined : ZoomIn.delay(delay).duration(duration);

export const webSafeZoomOut = (delay = 0, duration = 400) =>
  isWeb ? undefined : ZoomOut.delay(delay).duration(duration);
