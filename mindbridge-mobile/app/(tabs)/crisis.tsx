import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  StatusBar,
  Alert
} from 'react-native';
import { AuthContext } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import api from '../../src/services/api';
import { 
  Phone, 
  Building2,
  PhoneForwarded,
  MapPin,
  ChevronRight,
  Stethoscope,
  Users,
  BriefcaseMedical,
  Mail,
  Globe
} from 'lucide-react-native';

export const UNIVERSITY_COUNSELING_CENTERS: Record<string, any> = {
  'Kwame Nkrumah University of Science and Technology (KNUST)': {
    name: 'KNUST Counselling Center',
    number: '+233 50 644 9747',
    secondaryNumber: '+233 59 439 9777',
    email: 'counsellingcentre@gmail.com',
    description: 'Professional support for students & staff',
    address: 'J. Harper Building, Room 7B, Campus',
    services: ['Mental Health Support', 'Academic Counselling', 'Career Development']
  },
  'University of Ghana (UG)': {
    name: 'UG Careers & Counselling Centre',
    number: '+233 24 594 5752',
    secondaryNumber: '+233 20 499 9221',
    email: 'careers@st.ug.edu.gh',
    website: 'UG Careers & Counselling Services',
    description: 'Confidential psychological support',
    address: 'Legon Campus',
    services: [
      'Mental Health & Psycho-social Support: Treatment for depression, anxiety, stress, grief, and relationship counselling.',
      'Academic Counselling: Guidance on study skills, learning disorders, and academic stress management.',
      'Career Development: CV clinics, vocational counselling, and internship placement.',
      'Assessment: Psychometric and psychiatric assessment'
    ]
  },
  'University of Cape Coast (UCC)': {
    name: 'UCC Counselling Centre',
    number: '+233 33 213 2440',
    email: 'focansey@ucc.edu.gh',
    description: 'Mental health and career guidance services',
    address: 'North Campus, Cape Coast',
    services: ['Mental Health Support', 'Academic Guidance', 'Career Counselling']
  },
  'University of Education, Winneba (UEW)': {
    name: 'UEW Counselling Centre',
    number: '+233 24 317 0085',
    secondaryNumber: '+233 24 768 6494',
    email: 'counselling@uew.edu.gh',
    description: 'Holistic counselling for the university community',
    address: 'Student Centre, First Floor, North Campus',
    services: ['Personal Counselling', 'Academic Support']
  },
  'University for Development Studies (UDS)': {
    name: 'UDS Career Mentorship & Support',
    number: '+233 37 209 3697',
    secondaryNumber: '+233 54 544 7445',
    email: 'registrar@uds.edu.gh',
    description: 'Student support and career guidance',
    address: 'Tamale Campus',
    services: ['Career Counselling', 'General Support']
  },
  'Ashesi University': {
    name: 'Ashesi Counselling and Coaching Center',
    number: '+233 30 261 0330',
    secondaryNumber: '+233 24 880 7992',
    email: 'ddavis@ashesi.edu.gh',
    website: 'ashesicounsellingandcoachingcenter.simplybook.me',
    description: 'Holistic support for Ashesi students',
    address: 'Berekuso Campus',
    services: ['Emotional Support', 'Academic Coaching', 'Career Guidance']
  },
  'Academic City University College': {
    name: 'ACity Career Services & Support',
    number: '+233 59 403 0308',
    email: 'careerservices@acity.edu.gh',
    description: 'Wellness and career counseling for ACity students',
    address: 'Haatso, Accra',
    services: ['Career Counselling', 'Student Wellness']
  },
  'University of Professional Studies, Accra (UPSA)': {
    name: 'UPSA Counselling Unit',
    number: '+233 30 395 8571',
    description: 'Professional guidance and counseling unit',
    address: 'Student Services, Legon, Accra',
    services: ['Academic Counselling', 'Career Guidance', 'Personal Counselling']
  },
  'GIMPA': {
    name: 'GIMPA Counselling Unit',
    number: '+233 30 240 1681',
    email: 'gcu@gimpa.edu.gh',
    website: 'scheduler.gimpa.edu.gh/ea',
    description: 'Support for the GIMPA community',
    address: 'Greenhill, Accra',
    services: ['Individual Counselling', 'Group Counselling', 'Mental Health Consultations']
  },
  'Other': {
    name: 'National Counseling Center',
    number: '0800 678 678',
    description: 'General institutional support',
    address: 'Nationwide',
    services: ['General Support', 'Mental Health Referrals']
  }
};

export default function CrisisSupportScreen() {
  const insets = useSafeAreaInsets();
  const themeContext = useTheme();
  const { userData } = useContext(AuthContext);
  
  // Use userData.academic.institution if available, otherwise default to 'Other'
  const initialUni = userData?.academic?.institution || 'Other';
  const [userUni, setUserUni] = useState<string>(initialUni);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data?.onboarding?.university) {
          setUserUni(response.data.onboarding.university);
        }
      } catch (error) {
        console.warn('Network timeout when fetching profile, falling back to cached institution.');
      }
    };
    fetchProfile();
  }, []);

  const styles = createStyles(themeContext);
  
  // Dynamically create an institution if it's not in the hardcoded list
  const getInstitutionDetails = (uniName: string) => {
    if (UNIVERSITY_COUNSELING_CENTERS[uniName]) {
      return UNIVERSITY_COUNSELING_CENTERS[uniName];
    }
    
    if (uniName === 'Other') {
      return UNIVERSITY_COUNSELING_CENTERS['Other'];
    }

    return {
      name: `${uniName} Counseling Services`,
      number: '0800 678 678', // Generic crisis line fallback
      description: 'Please contact your local student affairs office or use the national crisis line.',
      address: 'Campus Administration',
      services: ['Mental Health Support', 'General Counseling', 'Crisis Management']
    };
  };

  const institution = getInstitutionDetails(userUni);

  const NEARBY_SERVICES = [
    {
      id: 'therapy',
      title: 'Private Therapy Clinics',
      description: 'Licensed psychologists and therapists for continued care',
      icon: Stethoscope,
      query: 'therapy+clinics+near+me',
      color: themeContext.colors.ocean,
    },
    {
      id: 'hospital',
      title: 'Mental Health Facilities',
      description: 'Psychiatric hospitals and intensive care units',
      icon: BriefcaseMedical,
      query: 'psychiatric+hospital+near+me',
      color: themeContext.colors.plum,
    },
    {
      id: 'support',
      title: 'Community Support Groups',
      description: 'Peer support, group therapy, and rehabilitation',
      icon: Users,
      query: 'mental+health+support+groups+near+me',
      color: themeContext.colors.accents.mossVelvet,
    }
  ];

  const handleCall = async (number: string) => {
    try {
      const url = `tel:${number.replace(/\s+/g, '')}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unavailable', 'Your device does not support calling at this time.');
      }
    } catch (error) {
      console.warn('Error opening dialer:', error);
    }
  };

  const handleMap = async (query: string) => {
    try {
      const url = `https://www.google.com/maps/search/${query}`;
      await Linking.openURL(url);
    } catch (error) {
      console.warn('Error opening maps:', error);
      Alert.alert('Map Unavailable', 'Unable to open maps. Please search manually for local services.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={themeContext.isDark ? "light-content" : "dark-content"} />
      

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader 
          title="Care Navigator" 
          subtitle="Institutional support & local mental health services allocation"
        />

        <Animated.View entering={FadeInUp.delay(100).duration(800)} style={styles.section}>
          <Text style={styles.sectionTitle}>Your Institutional Care</Text>
          
          <View style={styles.institutionCard}>
            <View style={styles.instHeader}>
              <View style={[styles.iconWrap, { backgroundColor: themeContext.colors.plum + '20' }]}>
                <Building2 color={themeContext.colors.plum} size={28} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.instTitle}>{institution.name}</Text>
                <Text style={styles.instDesc}>{institution.description}</Text>
              </View>
            </View>

            <View style={styles.instDetails}>
              {institution.address && (
                <View style={styles.detailRow}>
                  <MapPin size={16} color={themeContext.colors.text.tertiary} />
                  <Text style={styles.detailText}>{institution.address}</Text>
                </View>
              )}
              {institution.email && (
                <View style={styles.detailRow}>
                  <Mail size={16} color={themeContext.colors.text.tertiary} />
                  <Text style={styles.detailText}>{institution.email}</Text>
                </View>
              )}
              {institution.website && (
                <View style={styles.detailRow}>
                  <Globe size={16} color={themeContext.colors.text.tertiary} />
                  <Text style={styles.detailText}>{institution.website}</Text>
                </View>
              )}
              {institution.services && (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: themeContext.colors.text.primary, marginBottom: 8 }}>Key Services</Text>
                  {institution.services.map((service: string, idx: number) => (
                    <View key={idx} style={{ flexDirection: 'row', marginBottom: 4 }}>
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: themeContext.colors.plum, marginTop: 7, marginRight: 8 }} />
                      <Text style={{ fontSize: 13, color: themeContext.colors.text.secondary, flex: 1, lineHeight: 18 }}>{service}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity  
              style={styles.primaryCallBtn}
              onPress={() => handleCall(institution.number)}
              activeOpacity={0.8}
            >
              <Phone color="#FFF" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.primaryCallText}>Call {institution.secondaryNumber ? 'Primary Line' : 'Counseling Services'}</Text>
            </TouchableOpacity>

            {institution.secondaryNumber && (
              <TouchableOpacity  
                style={[styles.primaryCallBtn, { backgroundColor: themeContext.colors.accents.powderBlue, marginTop: 8 }]}
                onPress={() => handleCall(institution.secondaryNumber)}
                activeOpacity={0.8}
              >
                <Phone color="#FFF" size={20} style={{ marginRight: 8 }} />
                <Text style={styles.primaryCallText}>Call Secondary Line</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Services & Therapy</Text>
          <Text style={styles.sectionSubtitle}>Allocated community services for extended support outside campus.</Text>
          
          {NEARBY_SERVICES.map((service, index) => (
            <Animated.View key={service.id} entering={FadeInUp.delay(400 + (index * 100)).duration(500)}>
              <TouchableOpacity  
                style={styles.serviceCard}
                onPress={() => handleMap(service.query)}
                activeOpacity={0.8}
              >
                <View style={[styles.serviceIconWrap, { backgroundColor: service.color + (themeContext.isDark ? '25' : '15') }]}>
                  <service.icon color={service.color} size={24} />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDesc}>{service.description}</Text>
                </View>
                <ChevronRight color={themeContext.colors.text.disabled} size={20} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700).duration(500)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeContext.colors.semantic.danger }]}>National Crisis Fallbacks</Text>
          
          <TouchableOpacity  
            style={[styles.fallbackCard, { backgroundColor: themeContext.colors.semantic.danger, borderColor: themeContext.colors.semantic.danger }]}
            onPress={() => handleCall('112')}
            activeOpacity={0.8}
          >
            <View style={[styles.serviceIconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Phone color="#FFF" size={22} />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={[styles.serviceTitle, { color: '#FFF' }]}>National Emergency (112)</Text>
              <Text style={[styles.serviceDesc, { color: 'rgba(255,255,255,0.8)' }]}>Police, Fire, Ambulance (24/7)</Text>
            </View>
            <PhoneForwarded color="#FFF" size={20} />
          </TouchableOpacity>

        </Animated.View>

      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  institutionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: theme.isDark ? 0.2 : 0.05,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
  },
  instHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  instTitle: {
    fontSize: 18,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  instDesc: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  instDetails: {
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  primaryCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.plum,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: theme.colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCallText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.2 : 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
  },
  serviceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  fallbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.semantic.danger + '30',
  }
});
