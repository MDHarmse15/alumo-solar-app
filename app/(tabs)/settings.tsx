import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, StatusBar, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles, SPACING, BORDER_RADIUS } from '@/constants/Styles';
import { useThemeColor } from '@/constants/Styles';

export default function SettingsScreen() {
  const globalStyles = useGlobalStyles();
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');
  
  // Example state for toggle switches
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={globalStyles.title}>Settings</Text>
          <Text style={globalStyles.textSecondary}>Manage your app preferences</Text>
        </View>

        <View style={[globalStyles.card, styles.profileCard]}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Ionicons name="person" size={40} color="white" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>John Doe</Text>
              <Text style={styles.profileEmail}>john.doe@example.com</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.profileAction}>
            <Text style={styles.profileActionText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={primaryColor} />
          </TouchableOpacity>
        </View>

        <View style={[globalStyles.card, styles.settingsSection]}>
          <Text style={[globalStyles.subtitle, styles.sectionTitle]}>App Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="notifications-outline" size={24} color={primaryColor} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#767577", true: "#4BB377" }}
              thumbColor={notificationsEnabled ? primaryColor : "#f4f3f4"}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="moon-outline" size={24} color={primaryColor} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: "#767577", true: "#4BB377" }}
              thumbColor={darkModeEnabled ? primaryColor : "#f4f3f4"}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="location-outline" size={24} color={primaryColor} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Location Services</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: "#767577", true: "#4BB377" }}
              thumbColor={locationEnabled ? primaryColor : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={[globalStyles.card, styles.settingsSection]}>
          <Text style={[globalStyles.subtitle, styles.sectionTitle]}>System Settings</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="cog-outline" size={24} color={primaryColor} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>System Configuration</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="shield-outline" size={24} color={primaryColor} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="cloud-upload-outline" size={24} color={primaryColor} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Backup & Restore</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </TouchableOpacity>
        </View>

        <View style={[globalStyles.card, styles.settingsSection]}>
          <Text style={[globalStyles.subtitle, styles.sectionTitle]}>Help & Support</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="help-circle-outline" size={24} color={primaryColor} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>FAQs</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="call-outline" size={24} color={primaryColor} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="information-circle-outline" size={24} color={primaryColor} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>About</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="white" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  profileCard: {
    marginBottom: SPACING.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  profileImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#289F5D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  profileEmail: {
    color: '#9E9E9E',
  },
  profileAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  profileActionText: {
    color: '#289F5D',
    fontWeight: '500',
  },
  settingsSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: SPACING.sm,
  },
  settingLabel: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#E63946',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
  },
  logoutIcon: {
    marginRight: SPACING.xs,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 