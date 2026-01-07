import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  Pressable,
  Modal,
  Dimensions,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Text } from 'react-native-paper';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = SPACING.sm;
const NUM_COLUMNS = 3;
const IMAGE_SIZE = (SCREEN_WIDTH - SPACING.lg * 2 - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

interface PortfolioGalleryProps {
  images: string[];
  onImagePress?: (index: number) => void;
}

export function PortfolioGallery({
  images,
}: PortfolioGalleryProps): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleImagePress = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handlePrevious = useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  }, [selectedIndex]);

  const handleNext = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  }, [selectedIndex, images.length]);

  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <Animated.View entering={FadeIn.delay(index * 50).duration(300)}>
        <Pressable
          onPress={() => handleImagePress(index)}
          style={({ pressed }) => [
            styles.imageContainer,
            pressed && styles.imagePressed,
          ]}
        >
          <Image source={{ uri: item }} style={styles.gridImage} />
        </Pressable>
      </Animated.View>
    ),
    [handleImagePress]
  );

  if (images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No portfolio images yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        numColumns={NUM_COLUMNS}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
      />

      <Modal
        visible={selectedIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalClose} onPress={handleClose}>
            <X size={28} color={COLORS.textInverse} />
          </Pressable>

          {selectedIndex !== null && (
            <>
              <Image
                source={{ uri: images[selectedIndex] }}
                style={styles.fullImage}
                resizeMode="contain"
              />

              <View style={styles.navigationContainer}>
                <Pressable
                  style={[
                    styles.navButton,
                    selectedIndex === 0 && styles.navButtonDisabled,
                  ]}
                  onPress={handlePrevious}
                  disabled={selectedIndex === 0}
                >
                  <ChevronLeft size={32} color={COLORS.textInverse} />
                </Pressable>

                <Text style={styles.imageCounter}>
                  {selectedIndex + 1} / {images.length}
                </Text>

                <Pressable
                  style={[
                    styles.navButton,
                    selectedIndex === images.length - 1 && styles.navButtonDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={selectedIndex === images.length - 1}
                >
                  <ChevronRight size={32} color={COLORS.textInverse} />
                </Pressable>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    paddingHorizontal: SPACING.lg,
  },
  row: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  imageContainer: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  imagePressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  gridImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    backgroundColor: COLORS.backgroundSecondary,
  },
  emptyContainer: {
    padding: SPACING['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textMuted,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: SPACING.md,
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  imageCounter: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textInverse,
    fontWeight: TYPOGRAPHY.semibold,
  },
});
