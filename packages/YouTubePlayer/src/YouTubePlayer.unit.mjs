import { dirname } from 'path';
import { fileURLToPath } from 'url';
import test from 'ava';
import getDOM from '../../../src/testHelpers/getDOM.mjs';
import jsdom from 'jsdom';

// Tests will time out, probably because JSDOM / YouTube do not finish a network request or a DOM
// operation. Solution is compliacted, I wasn't able to get one in a reasonable time.

const setup = async (hideErrors) => {
    const basePath = dirname(fileURLToPath(new URL(import.meta.url)));
    return getDOM({ basePath, scripts: ['YouTubePlayerElement.js'], hideErrors });
};

const createElement = (document, html) => {
    const container = document.createElement('div');
    container.innerHTML = html;
    return container.firstChild;
};

test('loads API on mouseenter', async (t) => {
    const { window, document, errors } = await setup(true);
    const player = createElement(document, '<youtube-player-component data-video-id="m7MtIv9a0A4" data-loading-class-name="loading"></youtube-player-component>');
    document.body.appendChild(player);
    player.dispatchEvent(new window.MouseEvent('mouseenter'));
    await player.video;
    // Awaiting the video should not timeout here; that's all we need to test for as the
    // YouTube API won't be loading without the mouseenter event
    t.is(errors.length, 0);
});

test('adds loading class on click', async (t) => {
    const { window, document, errors } = await setup(true);
    const player = createElement(document, '<youtube-player-component data-video-id="m7MtIv9a0A4" data-loading-class-name="loading"></youtube-player-component>');
    document.body.appendChild(player);
    player.dispatchEvent(new window.MouseEvent('click'));
    t.is(player.classList.contains('loading'), true);
    t.is(errors.length, 0);
});

test('replaces player when ready', async (t) => {
    const { window, document, errors } = await setup(true);
    const player = createElement(document, '<youtube-player-component data-video-id="m7MtIv9a0A4" data-loading-class-name="loading"></youtube-player-component>');
    document.body.appendChild(player);
    player.dispatchEvent(new window.MouseEvent('click'));
    await player.player;
    // loading class is removed
    t.is(player.classList.contains('loading'), false);
    t.is(player.querySelectorAll('iframe').length, 1);
    t.is(errors.length, 0);
});

test('uses player variables', async (t) => {
    const { window, document, errors } = await setup(true);
    const player = createElement(document, '<youtube-player-component data-video-id="m7MtIv9a0A4" data-player-variables=\'{"controls": 0}\' data-loading-class-name="loading"></youtube-player-component>');
    document.body.appendChild(player);
    player.dispatchEvent(new window.MouseEvent('click'));
    await player.player;
    // loading class is removed
    t.is(player.innerHTML.includes('controls=0'), true);
    t.is(errors.length, 0);
});

test('exposes player', async (t) => {
    const { window, document, errors } = await setup(true);
    const player = createElement(document, '<youtube-player-component data-video-id="m7MtIv9a0A4"></youtube-player-component>');
    document.body.appendChild(player);
    player.dispatchEvent(new window.MouseEvent('click'));
    t.is(player.player instanceof window.Promise, true);
    const playerProperty = await player.player;
    // We cannot really test for YouTube Player, as there are no good public properties/methods
    // while it's still loading (and JSDOM does never execute onReady); just check if it's an
    // object.
    t.is(typeof playerProperty, 'object');
    t.is(errors.length, 0);
});

test('respects cookie choice', async (t) => {
    const { window, document, errors } = await setup(true);
    // Test with cookies
    const player = createElement(document, '<youtube-player-component data-video-id="m7MtIv9a0A4" data-use-cookies></youtube-player-component>');
    document.body.appendChild(player);
    player.dispatchEvent(new window.MouseEvent('click'));
    t.is(player.player instanceof window.Promise, true);
    await player.player;
    t.is(
        document.querySelector('iframe').getAttribute('src').startsWith('https://www.youtube.com'),
        true,
    );
    // Test embedding without cookies
    const noCookiePlayer = createElement(document, '<youtube-player-component data-video-id="m7MtIv9a0A4"></youtube-player-component>');
    document.body.appendChild(noCookiePlayer);
    noCookiePlayer.dispatchEvent(new window.MouseEvent('click'));
    await noCookiePlayer.player;
    t.is(
        document.querySelectorAll('iframe')[1].getAttribute('src').startsWith('https://www.youtube-nocookie.com'),
        true,
    );
    t.is(errors.length, 0);
});
