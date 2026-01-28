import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Text } from 'react-native-paper';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  RotateCcw,
  MessageCircle,
} from 'lucide-react-native';
import { DARK_COLORS, SPACING, RADIUS } from '@/constants/theme';
import { useCall } from './useLiveKit';

interface VideoCallScreenProps {
  sessionId?: string;
  recipientId?: string;
  recipientName?: string;
  type: 'video' | 'voice';
  bookingId?: string;
  onEnd?: () => void;
}

export function VideoCallScreen({
  sessionId,
  recipientId,
  recipientName,
  type,
  bookingId,
  onEnd,
}: VideoCallScreenProps) {
  const { activeSession, roomToken, isConnecting, isInCall, startCall, answerCall, hangUp } = useCall();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(type === 'voice');
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  // Start timer when in call
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = useCallback(async () => {
    if (recipientId) {
      await startCall(recipientId, type, bookingId);
    }
  }, [recipientId, type, bookingId, startCall]);

  const handleAnswerCall = useCallback(async () => {
    if (sessionId) {
      await answerCall(sessionId);
    }
  }, [sessionId, answerCall]);

  const handleHangUp = useCallback(async () => {
    await hangUp();
    onEnd?.();
  }, [hangUp, onEnd]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    // LiveKit mute logic would go here
  }, []);

  const toggleVideo = useCallback(() => {
    setIsVideoOff((prev) => !prev);
    // LiveKit video toggle would go here
  }, []);

  const switchCamera = useCallback(() => {
    setIsFrontCamera((prev) => !prev);
    // LiveKit camera switch would go here
  }, []);

  // Render connecting state
  if (isConnecting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.connectingContainer}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {recipientName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.connectingText}>Connecting...</Text>
          <Text style={styles.recipientName}>{recipientName}</Text>
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.hangUpButton} onPress={handleHangUp}>
            <PhoneOff size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render waiting for answer (outgoing call)
  if (!isInCall && recipientId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.connectingContainer}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {recipientName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.callingText}>
            {type === 'video' ? 'Video calling...' : 'Calling...'}
          </Text>
          <Text style={styles.recipientName}>{recipientName}</Text>
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={toggleMute}
          >
            {isMuted ? (
              <MicOff size={24} color="#FFFFFF" />
            ) : (
              <Mic size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.hangUpButton} onPress={handleHangUp}>
            <PhoneOff size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {type === 'video' && (
            <TouchableOpacity
              style={[styles.controlButton, isVideoOff && styles.controlButtonActive]}
              onPress={toggleVideo}
            >
              {isVideoOff ? (
                <VideoOff size={24} color="#FFFFFF" />
              ) : (
                <Video size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Render incoming call
  if (!isInCall && sessionId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.connectingContainer}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {recipientName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.incomingText}>
            {type === 'video' ? 'Incoming video call' : 'Incoming call'}
          </Text>
          <Text style={styles.recipientName}>{recipientName}</Text>
        </View>

        <View style={styles.incomingControls}>
          <TouchableOpacity style={styles.declineButton} onPress={handleHangUp}>
            <PhoneOff size={28} color="#FFFFFF" />
            <Text style={styles.buttonLabel}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.acceptButton} onPress={handleAnswerCall}>
            {type === 'video' ? (
              <Video size={28} color="#FFFFFF" />
            ) : (
              <Mic size={28} color="#FFFFFF" />
            )}
            <Text style={styles.buttonLabel}>Accept</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render active call
  return (
    <SafeAreaView style={styles.container}>
      {/* Video views would be rendered here with LiveKit components */}
      <View style={styles.videoContainer}>
        {type === 'video' && !isVideoOff ? (
          <View style={styles.remoteVideo}>
            {/* Remote video stream */}
            <Text style={styles.placeholderText}>Remote Video</Text>
          </View>
        ) : (
          <View style={styles.voiceCallContainer}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>
                {recipientName?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={styles.recipientName}>{recipientName}</Text>
          </View>
        )}

        {type === 'video' && !isVideoOff && (
          <View style={styles.localVideo}>
            {/* Local video stream */}
            <Text style={styles.localPlaceholderText}>You</Text>
          </View>
        )}
      </View>

      {/* Call info */}
      <View style={styles.callInfo}>
        <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          {isMuted ? (
            <MicOff size={24} color="#FFFFFF" />
          ) : (
            <Mic size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        {type === 'video' && (
          <TouchableOpacity
            style={[styles.controlButton, isVideoOff && styles.controlButtonActive]}
            onPress={toggleVideo}
          >
            {isVideoOff ? (
              <VideoOff size={24} color="#FFFFFF" />
            ) : (
              <Video size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.hangUpButton} onPress={handleHangUp}>
          <PhoneOff size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {type === 'video' && (
          <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
            <RotateCcw size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.controlButton}>
          <MessageCircle size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_COLORS.background,
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: DARK_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  connectingText: {
    fontSize: 16,
    color: DARK_COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  callingText: {
    fontSize: 16,
    color: DARK_COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  incomingText: {
    fontSize: 16,
    color: DARK_COLORS.success,
    marginBottom: SPACING.sm,
  },
  recipientName: {
    fontSize: 24,
    fontWeight: '700',
    color: DARK_COLORS.textPrimary,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: DARK_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideo: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    width: 100,
    height: 140,
    borderRadius: RADIUS.lg,
    backgroundColor: DARK_COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: DARK_COLORS.border,
  },
  voiceCallContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: DARK_COLORS.textMuted,
    fontSize: 16,
  },
  localPlaceholderText: {
    color: DARK_COLORS.textMuted,
    fontSize: 12,
  },
  callInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  durationText: {
    fontSize: 18,
    fontWeight: '600',
    color: DARK_COLORS.textPrimary,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.lg,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: DARK_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: DARK_COLORS.border,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DARK_COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: DARK_COLORS.error,
  },
  hangUpButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: DARK_COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomingControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING['3xl'],
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  declineButton: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  acceptButton: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  buttonLabel: {
    fontSize: 12,
    color: DARK_COLORS.textPrimary,
  },
});

export default VideoCallScreen;
