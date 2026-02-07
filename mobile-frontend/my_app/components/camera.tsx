import React, { useCallback, useEffect, useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

export default function CameraPortal() {
  const insets = useSafeAreaInsets();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    let isMounted = true;

    const requestAccess = async () => {
      if (isMounted) {
        await requestPermission();
      }
    };

    requestAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings().catch(() => {
      // ignore settings errors (e.g. simulator)
    });
  }, []);

  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        paddingTop: Math.max(insets.top, 16),
        paddingBottom: Math.max(insets.bottom, 16),
      },
    ],
    [insets.bottom, insets.top],
  );

  return (
    <SafeAreaView style={containerStyle}>
      <View style={styles.placeholder}>
        {device && hasPermission ? (
          <Camera
            style={styles.previewSurface}
            device={device}
            isActive
          />
        ) : (
          <View style={styles.previewSurface} />
        )}
      </View>
      <Pressable onPress={handleOpenSettings} hitSlop={10}>
        <Text style={styles.settingsText}>Open Settings</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'flex-start',
  },
  placeholder: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  previewSurface: {
    flex: 1,
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  settingsText: {
    marginTop: 12,
    alignSelf: 'center',
    color: '#2563EB',
    fontSize: 12,
  },
});
