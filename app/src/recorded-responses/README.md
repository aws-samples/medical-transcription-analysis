# Pre-recorded responses

This directory contains all the pre-recorded responses for use in offline mode.

## Updating recorded responses.

For Transcribe results

- Bring up the debug menu by pressing Shift 3 times
- Disable offline mode so you're definitely hitting the live endpoint
- Play the sample file you want
- Once it's completely finished transcribing, hit "copy transcription results"
- Paste the content into the corresponding JSON file

For Comprehend results

- Replace the contents of `comprehension-cache.json` with: `{}`
- Bring up the debug menu and disable offline mode as above
- Play **all** four samples in sequence to generate the full cache (do this by going back to the start each time - don't refresh your browser window in between)
- Hit "copy comprehend cache"
- Paste the content into `comprehension-cache.json`
