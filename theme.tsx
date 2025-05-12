import { StyleSheet, useColorScheme, ViewStyle, TextStyle, FlexAlignType, ImageStyle } from "react-native";

export interface ThemeColors {
  backgroundColor: string;
  textColor: string;
  buttonTextColor: string;
  inputBorderColor: string;
  inputBackgroundColor: string;
  primaryColor: string;
  placeholderTextColor: string;
  dangerColor: string;
}

export const THEME: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    backgroundColor: "#0B213E",
    textColor: "#fdfdfd",
    buttonTextColor: "#fdfdfd",
    inputBorderColor: "#00E798",
    inputBackgroundColor: "#0B213E",
    primaryColor: "#00E798",
    placeholderTextColor: "#63768D",
    dangerColor: "#FF2D55",
  },
  dark: {
    backgroundColor: "#0B213E",
    textColor: "#fdfdfd",
    buttonTextColor: "#fdfdfd",
    inputBorderColor: "#00E798",
    inputBackgroundColor: "#00E798",
    primaryColor: "#00E798",
    placeholderTextColor: "#63768D",
    dangerColor: "#FF2D55",
  },
};

export const FONTS = {
  centuryGothic: "Century-Gothic",
  centuryGothicBold: "Century-Gothic-Bold",
};

export interface ThemeStylesReturn {
  isDarkMode: boolean;
  placeholder: { color: string };
  background: ViewStyle;
  formContainer: ViewStyle;
  input: ViewStyle & TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  footer: ViewStyle;
  footerText: TextStyle;
  footerLink: TextStyle;
  loadingIndicator: ViewStyle;
  buttonContainer: ViewStyle;
  header: ViewStyle;
  image: ImageStyle;
  container: ViewStyle;
  loadingText: TextStyle;
  logoText: TextStyle;
  [key: string]: any;
}

export const useThemeStyles = (): ThemeStylesReturn => {
  const colorScheme = useColorScheme();
  const theme = THEME[colorScheme === "dark" ? "dark" : "light"];
  const isDarkMode = colorScheme === "dark";

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "space-between", // Space elements vertically
      alignItems: "center",
      paddingVertical: 50, // Add padding at top and bottom
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0)", // Semi-transparent black overlay
    },
    safeArea: {
      flex: 1,
      backgroundColor: theme.backgroundColor, // Match the theme's background color
    },
    containerKBA: {
      flex: 1,
      justifyContent: "space-between",
      alignItems: "center",
      // padding: 20,S
      // backgroundColor: theme.backgroundColor,
    },
    header: {
      width: '100%',
      alignItems: "center",
      marginTop: '25%', // Position logo approximately 1/3 down
      fontFamily: FONTS.centuryGothic,
      color: theme.textColor,
    },
    image: {
      width: '80%', // Set width to 80% of screen
      height: undefined,
      aspectRatio: 3 / 1, // Adjust aspect ratio as needed
    },
    subtitle: {
      fontFamily: FONTS.centuryGothic,
      color: theme.textColor,
      fontSize: 16,
      marginTop: 10,
    },
    headerText: {
      fontFamily: FONTS.centuryGothicBold,
      fontSize: 24,
      color: theme.textColor,
      textAlign: "center",
      marginVertical: 20,
      textShadowColor: "rgba(0, 0, 0, 0.8)", 
      textShadowOffset: { width: 1, height: 1 }, 
      textShadowRadius: 3, 
    },
    scrollContainer: {
      paddingBottom: 100, // Space for FAB at the bottom
    },
    loadingText: {
      fontFamily: FONTS.centuryGothic,
      fontSize: 18,
      color: theme.textColor,
      textAlign: "center",
      marginVertical: 20,
    },
    listContainer: {
      flexGrow: 1, // Ensure the list takes up the remaining space
      width: "100%", // Ensure the list stretches to full width
      padding: 10,
    },
    // card: {
    //   backgroundColor: theme.inputBackgroundColor,
    //   borderRadius: 8,
    //   padding: 10,
    //   marginVertical: 5,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 2 },
    //   shadowOpacity: 0.2,
    //   shadowRadius: 4,
    //   elevation: 5,
    //   width: "85%", // Full width for the card
    //   alignSelf: "center", // Ensures the card stretches to parent width
    // },
    checkRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.primaryColor,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    descriptionCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.primaryColor,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    questionMark: {
      fontFamily: FONTS.centuryGothic,
      fontSize: 14,
      color: "#fff",
    },
    checkText: {
      fontFamily: FONTS.centuryGothic,
      fontSize: 16,
      color: theme.textColor,
      flexWrap: "wrap",
      width: "80%",
    },
    checkContent: {
      flex: 1,
      flexDirection: "column",
      marginLeft: 10,
    },
    checkDescription: {
      fontFamily: FONTS.centuryGothic,
      fontSize: 14,
      color: theme.textColor,
      marginTop: 5,
    },
    addImageButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.primaryColor,
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
      marginTop: 10,
    },
    addImageText: {
      fontSize: 16,
      color: theme.buttonTextColor,
      marginLeft: 10,
    },
    imageContainer: {
      position: "relative",
      marginRight: 10,
      padding: 5,
    },
    
    imagePreview: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    deleteButton: {
      position: "absolute",
      top: -8,
      right: -8,
      // backgroundColor: "red",
      width: 28,
      height: 28,
      borderRadius: 5,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },
    checkItem: {
      padding: 15,
      backgroundColor: "#f0f0f0",
      marginVertical: 8,
      borderRadius: 8,
    },
    checkItemText: {
      fontSize: 16,
      color: "#000",
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalText: {
      fontFamily: FONTS.centuryGothic,
      fontSize: 18,
      color: theme.textColor,
      marginBottom: 20,
    },
    closeButton: {
      backgroundColor: theme.primaryColor,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    closeButtonText: {
      fontFamily: FONTS.centuryGothicBold,
      fontSize: 16,
      color: theme.buttonTextColor,
    },
    cardTitle: {
      fontFamily: FONTS.centuryGothicBold,
      fontSize: 18,
      color: theme.textColor,
      marginBottom: 5,
    },
    cardSubtitle: {
      fontFamily: FONTS.centuryGothic,
      fontSize: 14,
      color: theme.placeholderTextColor,
    },
    fab: {
      position: "absolute",
      bottom: 20,
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.primaryColor,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    },
    fabOptions: {
      position: "absolute",
      bottom: 90,
      right: 20,
      // backgroundColor: "rgba(0, 122, 255, 0.95)",
      backgroundColor: theme.primaryColor,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 15,
      alignItems: "flex-start",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    fabOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
    },
    fabOptionText: {
      color: "#fff",
      fontSize: 16,
      marginLeft: 10,
      fontFamily: FONTS.centuryGothicBold,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
    },
    formContainer: {
      width: '90%',
      alignSelf: 'center',
      marginVertical: 20,
      marginTop: 'auto', // Push form toward bottom
      marginBottom: 20, // Space from bottom
    } as ViewStyle,
    message: {
      fontFamily: FONTS.centuryGothic,
      fontSize: 18,
      color: theme.textColor,
      textAlign: "center",
      lineHeight: 24,
      marginTop: 20,
    },
    restrictedText: {
      fontFamily: FONTS.centuryGothic,
      fontSize: 16,
      color: theme.dangerColor, // Use the theme's danger color
      textAlign: "center",
      marginVertical: 20,
    },
    restrictedContainer: {
      padding: 15,
      backgroundColor: "rgba(255, 69, 58, 0.2)", // Light red background
      borderRadius: 8,
      marginVertical: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    visitTemplateItem: {
      fontFamily: FONTS.centuryGothicBold,
      marginBottom: 10,
      borderRadius: 8,
      padding: 12,
      backgroundColor: THEME.light.primaryColor,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      alignItems: "center",
    },
    visitTemplateText: {
        fontFamily: FONTS.centuryGothic,
        fontSize: 16,
        color: THEME.light.textColor,
    },
    input: {
      height: 50,
      borderWidth: 1,
      borderColor: theme.inputBorderColor,
      backgroundColor: theme.inputBackgroundColor,
      borderRadius: 8,
      marginBottom: 15,
      paddingHorizontal: 15,
      color: theme.textColor,
      fontFamily: FONTS.centuryGothic,
    },
    buttonContainer: {
      width: '90%',
      alignSelf: 'center',
      marginTop: 'auto', // Push to bottom
      marginBottom: 50,
    },
    button: {
      backgroundColor: theme.primaryColor,
      borderRadius: 25,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    buttonText: {
      fontFamily: FONTS.centuryGothicBold,
      color: theme.buttonTextColor,
      fontSize: 16,
    },
    footer: {
      marginTop: 10, // Reduced margin from form
      marginBottom: 20,
      alignItems: 'center',
    } as ViewStyle,
    footerText: {
      fontFamily: FONTS.centuryGothic,
      color: theme.textColor,
      fontSize: 14,
    } as TextStyle,
    footerLink: {
      fontFamily: FONTS.centuryGothicBold,
      color: theme.primaryColor,
    } as TextStyle,
    background: {
      flex: 1,
      width: '100%',
      backgroundColor: theme.backgroundColor,
    } as ViewStyle,
    placeholder: { color: theme.placeholderTextColor },
    groupContainer: {
      marginBottom: 10,
      borderRadius: 8,
      padding: 10,
      backgroundColor: theme.inputBackgroundColor,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    groupHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderColor: theme.inputBorderColor,
    },
    groupTitle: {
      fontFamily: FONTS.centuryGothicBold,
      fontSize: 16,
      color: theme.textColor,
    },
    templateItem: {
      fontFamily: FONTS.centuryGothicBold,
      marginBottom: 10,
      borderRadius: 8,
      padding: 12,
      backgroundColor: theme.primaryColor,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    templateText: {
      fontFamily: FONTS.centuryGothic,
      fontSize: 16,
      color: theme.textColor,
    },saveButton: {
      backgroundColor: theme.primaryColor,
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      margin: 20,
    },
    saveButtonText: {
      color: theme.buttonTextColor,
      fontFamily: FONTS.centuryGothicBold,
      fontSize: 16,
    },
    checkCard: {
      backgroundColor: theme.inputBackgroundColor,
      borderRadius: 8,
      marginVertical: 10,
      padding: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    modalContent: {
      backgroundColor: theme.backgroundColor,
      padding: 20,
      width: "80%",
      borderRadius: 10,
      alignItems: "center",
    },
    modalTitle: {
      fontFamily: FONTS.centuryGothicBold,
      fontSize: 18,
      color: theme.textColor,
      marginBottom: 15,
    },
    modalButtons: {
      flexDirection: "row",
      marginTop: 10,
    },
    modalButton: {
      backgroundColor: theme.primaryColor,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginHorizontal: 5,
    },
    modalButtonText: {
      fontFamily: FONTS.centuryGothic,
      color: theme.buttonTextColor,
      fontSize: 16,
      textAlign: "center",
    },
    modalInput: {
      backgroundColor: theme.inputBackgroundColor,
      borderColor: theme.inputBorderColor,
      color: theme.textColor,
      padding: 15,
      borderWidth: 1,
      borderRadius: 8,
      fontSize: 16,
      marginBottom: 15,
      width: "90%",
      fontFamily: FONTS.centuryGothic,
    },
    card: {
      flexDirection: "column", 
      justifyContent: "space-between", 
      alignItems: "center", 
      backgroundColor: theme.inputBackgroundColor,
      padding: 15,
      marginVertical: 10,
      marginHorizontal: 15,
      borderRadius: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    cardLeft: {
      flex: 1, 
    },
    cardRight: {
      flexDirection: "row", 
      alignItems: "center",
    },
    siteVisitCard: {
      flexDirection: "column",
      width: "100%",
      padding: 7,
      backgroundColor: "#3F5170",
      marginVertical: 5,
      borderRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 4,
    },
    visitNameContainer: {
      marginTop: 20,
      marginHorizontal: 20,
      padding: 10,
      // backgroundColor: theme.backgroundColor,
      borderRadius: 8,
      alignItems: "center",
    },
    visitName: {
      fontFamily: FONTS.centuryGothicBold,
      fontSize: 20,
      fontWeight: "bold",
      color: theme.textColor,
      textAlign: "center",
      textShadowColor: "rgba(0, 0, 0, 0.8)", 
      textShadowOffset: { width: 1, height: 1 }, 
      textShadowRadius: 3, 
    },
    visitNameInput: {
      fontFamily: FONTS.centuryGothicBold,
      fontSize: 20,
      fontWeight: "bold",
      color: theme.textColor,
      textAlign: "center",
      borderBottomWidth: 1,
      paddingBottom: 5,
      width: "100%",
    },
    commentText: {
      fontSize: 14,
      color: "#fff",
      marginVertical: 8,
    },
    commentLabel: {
      fontWeight: "bold",
    },
    captureButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    closeCameraButton: {
      position: "absolute",
      top: 20,
      right: 20,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      padding: 10,
      borderRadius: 5,
    },
    selectImageButton: {
      marginVertical: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      padding: 15,
      borderRadius: 50,
    },
    // closeCameraButton: {
    //   marginVertical: 10,
    //   alignItems: "center",
    //   justifyContent: "center",
    //   backgroundColor: "rgba(0, 0, 0, 0.5)",
    //   padding: 15,
    //   borderRadius: 50,
    // },
    // captureButton: {
    //   marginVertical: 10,
    //   alignItems: "center",
    //   justifyContent: "center",
    //   backgroundColor: "rgba(0, 0, 0, 0.5)",
    //   padding: 15,
    //   borderRadius: 50,
    // },
    fullscreenModal: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      justifyContent: "center",
      alignItems: "center",
    },
    fullscreenImage: {
      width: "90%",
      height: "90%",
      resizeMode: "contain",
    },
    closeFullscreenButton: {
      position: "absolute",
      top: 40,
      right: 20,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      padding: 10,
      borderRadius: 20,
    },
    loadingIndicator: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    siteVisitTitle: {
      fontFamily: FONTS.centuryGothicBold,
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    siteVisitSubtitle: {
      fontFamily: FONTS.centuryGothic,
      fontSize: 14,
      color: "#CCC",
      marginTop: 2,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    addSiteVisitButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 10,
      marginTop: 10,
      borderRadius: 20,
      width: 40,
      height: 40,
      backgroundColor: theme.primaryColor,
    },
    addSiteVisitText: {
      fontSize: 14,
      color: "#fff",
      marginLeft: 8,
      fontWeight: "600",
    },
    expandedContent: {
      flexDirection: "column",
      width: "100%",
      marginTop: 10,
      paddingLeft: 10,
      alignContent: "center",
      justifyContent: "center",
      elevation: 4,
    },
    expandedCard: {
      marginBottom: 20, // Ensure spacing between expanded cards
    },
    addGroupButton: {
      backgroundColor: theme.primaryColor,
      fontFamily: FONTS.centuryGothic,
      padding: 10,
      borderRadius: 5,
      marginVertical: 15,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      width: "30%",
    },
    addGroupButtonText: {
      color: "#fff",
      fontFamily: FONTS.centuryGothic,
      fontSize: 16,
      marginLeft: 5,
    },
    addCheckButton: {
      backgroundColor: theme.primaryColor,
      padding: 8,
      borderRadius: 5,
      marginVertical: 10,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      width: "30%",
      fontFamily: FONTS.centuryGothic,
    },
    addCheckButtonText: {
      color: "#fff",
      fontFamily: FONTS.centuryGothic,
      fontSize: 14,
      marginLeft: 5,
    },
    modalConfirmButton: {
      backgroundColor: theme.primaryColor,
      fontFamily: FONTS.centuryGothic,
      color: theme.buttonTextColor,
      padding: 8,
      borderRadius: 5,
      width: "50%",
      justifyContent: "center",
      alignItems: "center",
    },
    modalCancelButton: {
      backgroundColor: theme.dangerColor,
      fontFamily: FONTS.centuryGothic,
      color: theme.buttonTextColor,
      paddingVertical: 10,
      borderRadius: 5,
      marginHorizontal: 5,
      width: "50%",
      justifyContent: "center",
      alignItems: "center",
    },
    quantityItem: {
      marginVertical: 8,
      fontFamily: FONTS.centuryGothic,
      padding: 10,
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Light transparent background
      borderRadius: 5,
      borderWidth: 1,
      borderColor: "#ccc",
    },
    quantityLabel: {
      fontSize: 14,
      fontFamily: FONTS.centuryGothic,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 5,
    },
    quantityInput: {
      backgroundColor: theme.inputBackgroundColor,
      borderColor: theme.inputBorderColor,
      color: theme.textColor,
      padding: 15,
      borderWidth: 1,
      borderRadius: 8,
      fontSize: 16,
      marginBottom: 15,
      width: "90%",
      fontFamily: FONTS.centuryGothic,
    },
    visitTemplateContainer: {
      marginBottom: 10,
      borderRadius: 8,
      padding: 12,
      backgroundColor: theme.primaryColor,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      width: "70%",
      alignItems: "center",
    },
    templateTitle: {
      fontFamily: FONTS.centuryGothicBold,
      fontSize: 18,
      color: theme.textColor,
      marginBottom: 5,
    },
    disabledButton: {
      opacity: 0.5, // Reduce opacity to indicate disabled state
      backgroundColor: "#A9A9A9", // Use a grayish background color
    },
    logoText: {
      fontFamily: FONTS.centuryGothicBold,
      fontSize: 36,
      color: theme.primaryColor,
      textAlign: 'center',
      letterSpacing: 2,
    },
  });

  return {
    isDarkMode,
    ...styles,
    placeholder: { color: theme.placeholderTextColor },
    background: {
      flex: 1,
      width: '100%',
      backgroundColor: theme.backgroundColor,
    } as ViewStyle,
    formContainer: {
      width: '90%',
      alignSelf: 'center',
      marginVertical: 20,
      marginTop: 'auto', // Push form toward bottom
      marginBottom: 20, // Space from bottom
    } as ViewStyle,
    input: {
      height: 50,
      borderWidth: 1,
      borderColor: theme.inputBorderColor,
      backgroundColor: theme.inputBackgroundColor,
      borderRadius: 8,
      marginBottom: 15,
      paddingHorizontal: 15,
      color: theme.textColor,
      fontFamily: FONTS.centuryGothic,
    } as ViewStyle & TextStyle,
    button: {
      backgroundColor: theme.primaryColor,
      borderRadius: 25,
      height: 50,
      alignItems: 'center' as 'center',
      justifyContent: 'center' as 'center',
      marginTop: 10,
    } as ViewStyle,
    buttonText: {
      fontFamily: FONTS.centuryGothicBold,
      color: theme.buttonTextColor,
      fontSize: 16,
    } as TextStyle,
    footer: {
      marginTop: 10, // Reduced margin from form
      marginBottom: 20,
      alignItems: 'center',
    } as ViewStyle,
    footerText: {
      fontFamily: FONTS.centuryGothic,
      color: theme.textColor,
      fontSize: 14,
    } as TextStyle,
    footerLink: {
      fontFamily: FONTS.centuryGothicBold,
      color: theme.primaryColor,
    } as TextStyle,
    loadingIndicator: {
      flex: 1,
      justifyContent: 'center' as 'center',
      alignItems: 'center' as 'center',
    } as ViewStyle,
    buttonContainer: {
      width: '90%',
      alignSelf: 'center' as 'center',
      marginTop: 'auto', // Push to bottom
      marginBottom: 50,
    } as ViewStyle,
    image: {
      width: '80%', // Set width to 80% of screen
      height: undefined,
      aspectRatio: 3 / 1, // Adjust aspect ratio as needed
    } as ImageStyle,
    logoText: {
      fontFamily: FONTS.centuryGothicBold,
      fontSize: 36,
      color: theme.primaryColor,
      textAlign: 'center',
      letterSpacing: 2,
    } as TextStyle,
  };
};