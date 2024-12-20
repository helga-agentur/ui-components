# YouTube Player

- Replaces DOM element with YouTube player on click.
- Auto-plays video when it's ready.
- Reads YouTube video ID and params from element's attributes.
- Reads loading class name from element attribute and adds it while the player is loading.
- Loads YouTube API only when needed (on click and pre-load on hover) and only once (looks for
window.YT or existing script tag first).

## Example

````html
<youtube-player-component
    data-video-id="m7MtIv9a0A4"
    data-loading-class-name="loading"
    data-player-variables='{ "controls": 0, "modestbranding": 1 }'
>
    Preview here
</youtube-player-component>

<!-- Import all components you use -->
<script src="@helga-agency/youtubeplayer/YouTubePlayerElement.js"></script>
````

## Components

### YouTubePlayer

#### Exposed Element
`<youtube-player-component></youtube-player-component>`

#### Attributes
- `data-video-id`: ID of the YouTube video to play.
- `data-loading-class-name`: Class that should be added to `<youtube-player-component>` while
the YouTube player (script) is loading.
- `data-player-variables`: [Player parameters](https://developers.google.com/youtube/player_parameters.html?playerVersion=HTML5)
for YouTube.
- `data-use-cookies` (boolean): If set, YouTube videos will be loaded from regular youtube.com domain; if not set, the videos will be loaded from the youtube-nocookie.com domain (by setting the [host parameter to the corresponding URL](https://stackoverflow.com/a/64444601) when the API is initialized).

#### Properties
- Exposes a `player` property on the custom element that corresponds to the instance of YT.Player
for the current video