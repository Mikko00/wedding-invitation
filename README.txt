UPDATED WEDDING WEBSITE
- RSVP button and form removed.
- Attire colors: sage green, blush pink, and warm beige (ivory removed from attire guide).
- Background music control added. Click Play music; browser sound requires user interaction.
- Add a licensed MP3 as assets/background-music.mp3 to use your own song. Otherwise a gentle synthesized instrumental melody is used.
- Prenup gallery has six slots. Add JPG photos as assets/prenup-1.jpg through assets/prenup-6.jpg.
Preview by opening index.html, or run `python -m http.server 8000` and visit http://localhost:8000.
Upload the complete folder when publishing.


AUTOPLAY
The site attempts to start background music when the page loads. Most browsers block audible
autoplay unless the visitor has interacted with the page, so playback retries on the first
tap/click/key press if blocked. To use the requested instrumental, add a licensed MP3 at
assets/background-music.mp3. Without that file, the first interaction starts the included
gentle synthesized instrumental fallback.


MUSIC CREDIT
Hover over or keyboard-focus the music button to view the attribution tooltip. The wording is
an attribution notice only and does not itself grant music rights or a license.
