import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { UserPlus, AlertCircle } from 'lucide-react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import FormInput from '../../components/common/FormInput';
import AppButton from '../../components/common/AppButton';
import { registerUser, getFirebaseErrorMessage } from '../../services/authService';
import ROUTES from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function RegisterScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');

    if (!fullName.trim()) {
      setNameError('Vui lòng nhập họ và tên.');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Vui lòng nhập email.');
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Địa chỉ email không hợp lệ.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có tối thiểu 6 ký tự.');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Vui lòng nhập lại mật khẩu.');
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Mật khẩu nhập lại không khớp.');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await registerUser(fullName, email, password);
      // Đăng ký thành công, Firebase Auth tự động sign in user -> AppNavigator sẽ chuyển vào MainTabs
    } catch (error: any) {
      console.error('Registration error:', error);
      const code = error?.code || '';
      setGeneralError(getFirebaseErrorMessage(code));
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
            <UserPlus size={36} color={colors.white} />
          </View>
          <Text style={styles.title}>Tạo Tài Khoản</Text>
          <Text style={styles.subtitle}>
            Đăng ký để kết nối và trò chuyện với mọi người
          </Text>
        </View>

        {/* General Error Banner */}
        {generalError ? (
          <View style={styles.errorBanner}>
            <AlertCircle size={20} color={colors.danger} style={styles.errorIcon} />
            <Text style={styles.errorBannerText}>{generalError}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View style={styles.form}>
          <FormInput
            label="Họ và tên"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (nameError) setNameError('');
            }}
            placeholder="Nguyễn Văn A"
            error={nameError}
            autoCapitalize="words"
          />

          <FormInput
            label="Địa chỉ Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            placeholder="example@gmail.com"
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormInput
            label="Mật khẩu (tối thiểu 6 ký tự)"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
            }}
            placeholder="••••••••"
            error={passwordError}
            secureTextEntry
          />

          <FormInput
            label="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (confirmPasswordError) setConfirmPasswordError('');
            }}
            placeholder="••••••••"
            error={confirmPasswordError}
            secureTextEntry
          />

          <AppButton
            title="Đăng Ký Tài Khoản"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerBtn}
          />

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginHint}>Đã có tài khoản? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.LOGIN)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.loginLink}>Đăng nhập</Text>
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
    paddingVertical: spacing.xl,
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
  registerBtn: {
    marginTop: spacing.sm,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loginHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  loginLink: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '700',
  },
});
