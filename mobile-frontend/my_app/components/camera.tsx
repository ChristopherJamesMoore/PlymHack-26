import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

const API_BASE =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5050'
    : 'http://192.168.0.160:5050';

export default function CameraPortal() {
  const insets = useSafeAreaInsets();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);
  const [resultsText, setResultsText] = useState('No results yet.');
  const [isScanning, setIsScanning] = useState(false);

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

  const handleScan = useCallback(async () => {
    if (!cameraRef.current || !hasPermission || !device || isScanning) return;

    try {
      setIsScanning(true);
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        qualityPrioritization: 'balanced',
      });

      const uri =
        Platform.OS === 'android' ? `file://${photo.path}` : photo.path;

      const form = new FormData();
      form.append('image', {
        uri,
        name: 'frame.jpg',
        type: 'image/jpeg',
      } as any);

      const res = await fetch(`${API_BASE}/detect`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        setResultsText('Scan failed.');
        return;
      }

      const data = await res.json();
      const top = data?.top;
      if (top?.label) {
        const conf =
          typeof top.conf === 'number' ? ` (${(top.conf * 100).toFixed(1)}%)` : '';
        setResultsText(`${top.label}${conf}`);
      } else {
        setResultsText('No results yet.');
      }
    } catch {
      setResultsText('Scan failed.');
    } finally {
      setIsScanning(false);
    }
  }, [device, hasPermission, isScanning]);

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
            photo
            ref={cameraRef}
          />
        ) : (
          <View style={styles.previewSurface} />
        )}
      </View>
      <Pressable
        onPress={handleScan}
        style={({ pressed }) => [
          styles.scanButton,
          pressed && styles.scanButtonPressed,
          isScanning && styles.scanButtonDisabled,
        ]}
        disabled={!hasPermission || !device || isScanning}
      >
        <Text style={styles.scanButtonText}>
          {isScanning ? 'Scanning...' : 'Scan'}
        </Text>
      </Pressable>
      <Text style={styles.resultsText}>{resultsText}</Text>
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
  scanButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scanButtonPressed: {
    opacity: 0.85,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 16,
  },
  resultsText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsText: {
    marginTop: 12,
    alignSelf: 'center',
    color: '#2563EB',
    fontSize: 12,
  },
});
