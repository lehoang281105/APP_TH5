import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MessageSquare, AlertCircle } from 'lucide-react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import FormInput from '../../components/common/FormInput';
import AppButton from '../../components/common/AppButton';
import { loginUser, getFirebaseErrorMessage } from '../../services/authService';
import ROUTES from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage('');
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Vui lòng nhập địa chỉ email.');
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      await loginUser(trimmedEmail, password);
      // Khi login thành công, Auth listener trong AppNavigator sẽ tự động chuyển vào MainTabs
    } catch (error: any) {
      console.error('Login error:', error);
      const code = error?.code || '';
      setErrorMessage(getFirebaseErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        {/* Header Logo */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <MessageSquare size={38} color={colors.white} />
          </View>
          <Text style={styles.title}>Đăng Nhập</Text>
          <Text style={styles.subtitle}>
            Chào mừng trở lại! Hãy đăng nhập để tiếp tục trò chuyện.
          </Text>
        </View>

        {/* Error Notification Banner */}
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <AlertCircle size={20} color={colors.danger} style={styles.errorIcon} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View style={styles.form}>
          <FormInput
            label="Địa chỉ Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="example@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormInput
            label="Mật khẩu"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="••••••••"
            secureTextEntry
          />

          <AppButton
            title="Đăng Nhập"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerHint}>Chưa có tài khoản? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.REGISTER)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    marginBottom: spacing.md,
  },
  errorIcon: {
    marginRight: spacing.sm,
  },
  errorBannerText: {
    ...typography.captionMedium,
    color: colors.danger,
    flex: 1,
  },
  form: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  loginBtn: {
    marginTop: spacing.sm,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  registerHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  registerLink: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '700',
  },
});
