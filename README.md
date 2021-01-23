# The Pandemic Archive of Voices

## step-by-step to extract audios from telegram and create json file

1. Download telegram data from groups, downloading only the voice messages

2. Clean DataExport folder, excluding data other groups

3. Clean `result.json` file, leaving only the array of messages from Archive of Voices group

4. Exclude pined message and other actions from message array

5. Convert `.ogg` audio files, copying them to the `data/` folder
	1. `npm run convert`

