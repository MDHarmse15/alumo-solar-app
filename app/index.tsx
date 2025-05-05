import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles, SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Styles';
import Button from '@/components/Button';
import { useThemeColor } from '@/constants/Styles';

const { width } = Dimensions.get('window');

export default function LandingPage() {
  const globalStyles = useGlobalStyles();
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const backgroundColor = useThemeColor({}, 'background');
  const router = useRouter();

  return (
    <SafeAreaView style={[globalStyles.container, styles.container]}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>ALUMO</Text>
          </View>
        </View>

        <View style={styles.heroSection}>
          <View style={styles.heroImagePlaceholder}>
            <Ionicons name="sunny" size={80} color={primaryColor} />
          </View>
          <Text style={[globalStyles.title, styles.heroTitle]}>
            Let's Turn You On!
          </Text>
          <Text style={[globalStyles.textSecondary, styles.heroSubtitle]}>
            Take charge of your home's power and electricity costs
          </Text>
        </View>

        <View style={styles.featureSection}>
          <View style={[globalStyles.card, styles.featureCard]}>
            <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
              <Ionicons name="sunny" size={24} color="white" />
            </View>
            <Text style={globalStyles.subtitle}>Premium Technology</Text>
            <Text style={globalStyles.textSecondary}>
              We source top components locally and internationally to deliver the best solar solution.
            </Text>
          </View>

          <View style={[globalStyles.card, styles.featureCard]}>
            <View style={[styles.iconContainer, { backgroundColor: secondaryColor }]}>
              <Ionicons name="people" size={24} color="white" />
            </View>
            <Text style={globalStyles.subtitle}>Expert Team</Text>
            <Text style={globalStyles.textSecondary}>
              Our in-house team is dedicated to meeting your energy needs with professional service.
            </Text>
          </View>

          <View style={[globalStyles.card, styles.featureCard]}>
            <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
              <Ionicons name="checkmark-circle" size={24} color="white" />
            </View>
            <Text style={globalStyles.subtitle}>End-To-End Solution</Text>
            <Text style={globalStyles.textSecondary}>
              We prioritize comprehensive care with seamless installation and support.
            </Text>
          </View>
        </View>
        
        <View style={styles.ctaSection}>
          <Button 
            title="Sign Up" 
            fullWidth 
            size="large" 
            onPress={() => router.push('/signup')}
          />
          
          <View style={styles.loginContainer}>
            <Text style={globalStyles.text}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={[globalStyles.text, styles.loginText]}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: StatusBar.currentHeight || 0,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoPlaceholder: {
    width: width * 0.5,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#289F5D',
    borderRadius: BORDER_RADIUS.md,
  },
  logoText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: 'white',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  heroImagePlaceholder: {
    width: width * 0.8,
    height: width * 0.6,
    backgroundColor: '#E5E5E5',
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heroTitle: {
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  featureSection: {
    marginBottom: SPACING.xl,
  },
  featureCard: {
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ctaSection: {
    marginBottom: SPACING.xl,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  loginText: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
}); 