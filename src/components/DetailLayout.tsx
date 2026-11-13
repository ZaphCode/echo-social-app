import { ReactNode, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useTheme from "@/hooks/useTheme";
import useAppNavigation from "@/navigation/useAppNavigation";
import { radius, space } from "@/theme/theme";
import IconButton from "./ui/IconButton";
import StorageImage from "./ui/StorageImage";

const HERO_HEIGHT = 380;

type Props = {
  photos: string[];
  children: ReactNode;
  /** Sticky bottom action bar (price + CTA). */
  footer?: ReactNode;
};

/** Service / contratación detail: paged photo hero, content sheet, sticky footer. */
export default function DetailLayout({ photos, children, footer }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const nav = useAppNavigation();
  const [page, setPage] = useState(0);
  const slides = photos.length > 0 ? photos : [""];

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={[styles.fill, { backgroundColor: colors.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: footer ? 120 + insets.bottom : space.xl }}
      >
        <View style={{ height: HERO_HEIGHT }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScroll}
          >
            {slides.map((path, index) => (
              <StorageImage
                key={`${path}-${index}`}
                bucket="service-photos"
                path={path}
                style={{ width, height: HERO_HEIGHT }}
              />
            ))}
          </ScrollView>
          {slides.length > 1 && (
            <View style={styles.dots} pointerEvents="none">
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === page && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>
        <View style={[styles.sheet, { backgroundColor: colors.bg }]}>{children}</View>
      </ScrollView>

      <View style={[styles.topBar, { top: insets.top + space.xs }]} pointerEvents="box-none">
        <IconButton icon="chevron-left" tone="glass" accessibilityLabel="Volver" onPress={nav.back} />
      </View>

      {footer ? (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.glass,
              borderColor: colors.line,
              paddingBottom: Math.max(insets.bottom, space.md),
            },
          ]}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  dots: {
    position: "absolute",
    bottom: 44,
    alignSelf: "center",
    flexDirection: "row",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    width: 20,
    backgroundColor: "#FFFFFF",
  },
  sheet: {
    marginTop: -28,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: space.gutter,
    paddingTop: space.lg,
    gap: space.lg,
  },
  topBar: {
    position: "absolute",
    left: space.md,
    right: space.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.gutter,
    paddingTop: space.md,
    borderTopWidth: 1,
  },
});
