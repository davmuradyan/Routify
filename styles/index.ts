import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 30,
    marginBottom: 70,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 1.2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  howbutton: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    padding: 8,
    borderRadius: 15,
    width: '60%', 
    height: 50,
  },
  langbutton: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingLeft: 8,
    backgroundColor: '#FFD700',
    padding: 8,
    borderRadius: 15,
    width: '60%', 
    height: 50,
  },
  pickerWrapper: {
    width: 150, // Fix width for iOS issues
    overflow: 'hidden', // Prevents layout bugs
  },
  picker: {
    height: 50,
    width: 150,
    color: 'black', // Works on Android, but not on iOS
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black', // Ensures visibility on iOS
  },

  // iOS Modal Picker Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  pickerios: {
    width: 200,
  }
  ,
  closeModal: {
    fontSize: 18,
    color: 'black',
    marginTop: 10,
  },
});