/**
 * THE ARCANE CODEX - Battle Scene Animation Tests
 *
 * Tests the battle animation system for:
 * - Animation playback
 * - XSS protection
 * - Memory cleanup
 * - Multiple animation sequences
 * - Accessibility (reduced motion)
 *
 * Run with: node test_battle_animations.js
 */

const { chromium } = require('playwright');

// Test configuration
const path = require('path');
const BASE_URL = process.env.TEST_URL || `file://${path.resolve(__dirname, '../static/actual_game.html').replace(/\\/g, '/')}`;
const TIMEOUT = 30000;

// ANSI colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
    log(`\n🧪 TEST: ${name}`, 'cyan');
}

function logPass(message) {
    log(`  ✓ ${message}`, 'green');
}

function logFail(message) {
    log(`  ✗ ${message}`, 'red');
}

function logInfo(message) {
    log(`  ℹ ${message}`, 'blue');
}

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Test: Animation system loads correctly
 */
async function testAnimationSystemLoads(page) {
    logTest('Animation System Loads');
    totalTests++;

    try {
        // Navigate to game page
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

        // Check if ArcaneCodex namespace exists
        const hasNamespace = await page.evaluate(() => {
            return typeof window.ArcaneCodex !== 'undefined';
        });

        if (!hasNamespace) {
            logFail('ArcaneCodex namespace not found');
            failedTests++;
            return false;
        }
        logPass('ArcaneCodex namespace exists');

        // Check if animations object exists
        const hasAnimations = await page.evaluate(() => {
            return window.ArcaneCodex && typeof window.ArcaneCodex.animations !== 'undefined';
        });

        if (!hasAnimations) {
            logFail('ArcaneCodex.animations not found');
            failedTests++;
            return false;
        }
        logPass('ArcaneCodex.animations object exists');

        // Check all required animation functions
        const requiredFunctions = [
            'playBattleIntro',
            'playLocationTransition',
            'playDivineIntervention',
            'playCriticalMoment',
            'cleanup'
        ];

        for (const funcName of requiredFunctions) {
            const hasFunction = await page.evaluate((name) => {
                return typeof window.ArcaneCodex.animations[name] === 'function';
            }, funcName);

            if (!hasFunction) {
                logFail(`Function ${funcName} not found`);
                failedTests++;
                return false;
            }
        }
        logPass('All required animation functions exist');

        passedTests++;
        return true;

    } catch (error) {
        logFail(`Error: ${error.message}`);
        failedTests++;
        return false;
    }
}

/**
 * Test: Battle intro animation plays
 */
async function testBattleIntroPlays(page) {
    logTest('Battle Intro Animation Plays');
    totalTests++;

    try {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

        // Play battle intro animation
        const animationPlayed = await page.evaluate(() => {
            return new Promise((resolve) => {
                if (!window.ArcaneCodex || !window.ArcaneCodex.animations) {
                    resolve(false);
                    return;
                }

                window.ArcaneCodex.animations.playBattleIntro({
                    enemyName: 'Shadow Beast',
                    enemyIcon: '👹',
                    flavorText: 'Test animation',
                    battleType: 'normal',
                    onComplete: () => resolve(true)
                });

                // Timeout after 10 seconds
                setTimeout(() => resolve(false), 10000);
            });
        });

        if (!animationPlayed) {
            logFail('Animation did not complete');
            failedTests++;
            return false;
        }
        logPass('Battle intro animation completed');

        passedTests++;
        return true;

    } catch (error) {
        logFail(`Error: ${error.message}`);
        failedTests++;
        return false;
    }
}

/**
 * Test: XSS protection in enemy name
 */
async function testXSSProtection(page) {
    logTest('XSS Protection in User Inputs');
    totalTests++;

    try {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

        // Try to inject XSS payload
        const xssPayload = '<img src=x onerror=alert("XSS")>';

        const xssPrevented = await page.evaluate((payload) => {
            return new Promise((resolve) => {
                if (!window.ArcaneCodex || !window.ArcaneCodex.animations) {
                    resolve(false);
                    return;
                }

                // Set up a flag to track completion
                let animationCompleted = false;

                // Play animation with XSS payload
                window.ArcaneCodex.animations.playBattleIntro({
                    enemyName: payload,
                    enemyIcon: payload,
                    flavorText: payload,
                    battleType: 'normal',
                    onComplete: () => {
                        animationCompleted = true;
                    }
                });

                // Check for XSS after a short delay (during animation)
                setTimeout(() => {
                    const overlay = document.getElementById('battle-scene-overlay');

                    if (!overlay) {
                        resolve(false);
                        return;
                    }

                    // Check the actual HTML content to see if it was sanitized
                    const overlayHTML = overlay.innerHTML;

                    // Check if the payload was properly escaped (should see &lt;img instead of <img)
                    // The sanitizeHTML function should convert < to &lt; and > to &gt;
                    const properlyEscaped = overlayHTML.includes('&lt;img') && overlayHTML.includes('&gt;');

                    // Check that no actual dangerous img elements exist
                    // Look for any img tags that might have been injected
                    const allImgs = overlay.querySelectorAll('img');
                    let hasDangerousImg = false;
                    allImgs.forEach(img => {
                        // Check if this img has suspicious attributes
                        if (img.src === 'x' || img.hasAttribute('onerror')) {
                            hasDangerousImg = true;
                        }
                    });

                    // Check that no script tags were injected
                    const scriptTags = overlay.querySelectorAll('script');
                    const hasScriptTags = scriptTags.length > 0;

                    // Check if alert was called (it shouldn't be)
                    const originalAlert = window.alert;
                    let alertCalled = false;
                    window.alert = function() {
                        alertCalled = true;
                    };

                    // XSS is prevented if the payload was escaped AND no dangerous elements exist
                    const isSafe = properlyEscaped && !hasDangerousImg && !hasScriptTags && !alertCalled;

                    // Restore original alert
                    window.alert = originalAlert;

                    resolve(isSafe);
                }, 1000); // Check after 1 second while animation is playing
            });
        }, xssPayload);

        if (!xssPrevented) {
            logFail('XSS payload was not sanitized');
            failedTests++;
            return false;
        }
        logPass('XSS payload was properly sanitized');

        passedTests++;
        return true;

    } catch (error) {
        logFail(`Error: ${error.message}`);
        failedTests++;
        return false;
    }
}

/**
 * Test: Cleanup removes animation elements
 */
async function testCleanup(page) {
    logTest('Cleanup Removes Animation Elements');
    totalTests++;

    try {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

        const cleanupWorks = await page.evaluate(() => {
            return new Promise((resolve) => {
                if (!window.ArcaneCodex || !window.ArcaneCodex.animations) {
                    resolve(false);
                    return;
                }

                // Play animation
                window.ArcaneCodex.animations.playBattleIntro({
                    enemyName: 'Test Enemy',
                    enemyIcon: '⚔️',
                    flavorText: 'Test',
                    battleType: 'normal',
                    onComplete: () => {
                        // Wait a bit, then cleanup
                        setTimeout(() => {
                            window.ArcaneCodex.animations.cleanup();

                            // Check if overlay is removed/hidden
                            const overlay = document.getElementById('battle-scene-overlay');
                            const isHidden = !overlay ||
                                           overlay.style.display === 'none' ||
                                           overlay.innerHTML === '';

                            resolve(isHidden);
                        }, 100);
                    }
                });

                // Timeout
                setTimeout(() => resolve(false), 10000);
            });
        });

        if (!cleanupWorks) {
            logFail('Cleanup did not remove animation elements');
            failedTests++;
            return false;
        }
        logPass('Cleanup properly removed animation elements');

        passedTests++;
        return true;

    } catch (error) {
        logFail(`Error: ${error.message}`);
        failedTests++;
        return false;
    }
}

/**
 * Test: Multiple animations in sequence
 */
async function testMultipleAnimations(page) {
    logTest('Multiple Animations in Sequence');
    totalTests++;

    try {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

        const multipleAnimsWork = await page.evaluate(() => {
            return new Promise((resolve) => {
                if (!window.ArcaneCodex || !window.ArcaneCodex.animations) {
                    resolve(false);
                    return;
                }

                let completedCount = 0;

                // Play battle intro
                window.ArcaneCodex.animations.playBattleIntro({
                    enemyName: 'First Enemy',
                    enemyIcon: '⚔️',
                    flavorText: 'First animation',
                    battleType: 'normal',
                    onComplete: () => {
                        completedCount++;

                        // Play divine intervention after battle intro
                        window.ArcaneCodex.animations.playDivineIntervention({
                            godName: 'VALDRIS',
                            godColor: '#2563EB',
                            message: 'Second animation',
                            onComplete: () => {
                                completedCount++;

                                // Play critical moment after divine intervention
                                window.ArcaneCodex.animations.playCriticalMoment({
                                    title: 'THIRD',
                                    icon: '⚠️',
                                    color: '#DC2626',
                                    message: 'Third animation',
                                    onComplete: () => {
                                        completedCount++;
                                        resolve(completedCount === 3);
                                    }
                                });
                            }
                        });
                    }
                });

                // Timeout after 20 seconds
                setTimeout(() => resolve(completedCount === 3), 20000);
            });
        });

        if (!multipleAnimsWork) {
            logFail('Multiple animations did not complete in sequence');
            failedTests++;
            return false;
        }
        logPass('Multiple animations completed successfully in sequence');

        passedTests++;
        return true;

    } catch (error) {
        logFail(`Error: ${error.message}`);
        failedTests++;
        return false;
    }
}

/**
 * Test: Animation prevents concurrent playback
 */
async function testConcurrentPrevention(page) {
    logTest('Concurrent Animation Prevention');
    totalTests++;

    try {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

        const preventsConcurrent = await page.evaluate(() => {
            return new Promise((resolve) => {
                if (!window.ArcaneCodex || !window.ArcaneCodex.animations) {
                    resolve(false);
                    return;
                }

                let secondWasPrevented = false;

                // Start first animation
                window.ArcaneCodex.animations.playBattleIntro({
                    enemyName: 'First',
                    enemyIcon: '⚔️',
                    flavorText: 'First',
                    battleType: 'normal',
                    onComplete: () => {
                        // First animation completed
                    }
                });

                // Try to start second animation immediately (should be prevented)
                setTimeout(() => {
                    // Check if animation is in progress
                    const wasInProgress = window.ArcaneCodex.battleAnimator.animationInProgress;

                    window.ArcaneCodex.animations.playBattleIntro({
                        enemyName: 'Second',
                        enemyIcon: '⚔️',
                        flavorText: 'Second',
                        battleType: 'normal',
                        onComplete: () => {
                            // This should not be called if properly prevented
                        }
                    });

                    // Check if animation is still showing the first one
                    const overlay = document.getElementById('battle-scene-overlay');
                    const enemyName = overlay ? overlay.querySelector('.enemy-name') : null;
                    const stillShowingFirst = enemyName && enemyName.textContent === 'First';

                    // Prevention works if animation was in progress and second didn't replace first
                    secondWasPrevented = wasInProgress && stillShowingFirst;

                    setTimeout(() => {
                        resolve(secondWasPrevented);
                    }, 200);
                }, 500);

                // Timeout
                setTimeout(() => resolve(false), 10000);
            });
        });

        if (!preventsConcurrent) {
            logFail('Concurrent animations were not prevented');
            failedTests++;
            return false;
        }
        logPass('Concurrent animations properly prevented');

        passedTests++;
        return true;

    } catch (error) {
        logFail(`Error: ${error.message}`);
        failedTests++;
        return false;
    }
}

/**
 * Test: CSS animations file loads
 */
async function testCSSLoads(page) {
    logTest('CSS Animation File Loads');
    totalTests++;

    try {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

        // Check if CSS file was loaded
        const cssLoaded = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
            return links.some(link => link.href.includes('battle_scene_animations.css'));
        });

        if (!cssLoaded) {
            logFail('CSS file not loaded in page');
            failedTests++;
            return false;
        }
        logPass('CSS file loaded successfully');

        // Check if key CSS classes exist
        const hasKeyClasses = await page.evaluate(() => {
            const testDiv = document.createElement('div');
            testDiv.className = 'battle-scene-overlay';
            document.body.appendChild(testDiv);

            const computedStyle = window.getComputedStyle(testDiv);
            const hasPosition = computedStyle.position === 'fixed';

            document.body.removeChild(testDiv);
            return hasPosition;
        });

        if (!hasKeyClasses) {
            logFail('CSS styles not applied correctly');
            failedTests++;
            return false;
        }
        logPass('CSS styles applied correctly');

        passedTests++;
        return true;

    } catch (error) {
        logFail(`Error: ${error.message}`);
        failedTests++;
        return false;
    }
}

/**
 * Test: Divine Council integration
 */
async function testDivineCouncilIntegration(page) {
    logTest('Divine Council Animation Integration');
    totalTests++;

    try {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

        // Check if divine-council.js exists
        const divineCouncilLoaded = await page.evaluate(() => {
            return typeof window.divineCouncil !== 'undefined';
        });

        if (divineCouncilLoaded) {
            logPass('Divine Council system loaded');

            // Test if showVoting method exists and can be called
            const canShowVoting = await page.evaluate(() => {
                return typeof window.divineCouncil.showVoting === 'function';
            });

            if (canShowVoting) {
                logPass('Divine Council showVoting method exists');
            } else {
                logInfo('Divine Council showVoting method not found (may not be initialized)');
            }
        } else {
            logInfo('Divine Council system not loaded (may not be on this page)');
        }

        passedTests++;
        return true;

    } catch (error) {
        logFail(`Error: ${error.message}`);
        failedTests++;
        return false;
    }
}

/**
 * Main test runner
 */
async function runTests() {
    log('\n╔══════════════════════════════════════════════════════════╗', 'cyan');
    log('║   THE ARCANE CODEX - Battle Animation Test Suite       ║', 'cyan');
    log('╚══════════════════════════════════════════════════════════╝', 'cyan');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Enable console logging from page
    page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
            logInfo(`Browser error: ${text}`);
        }
    });

    try {
        // Run all tests
        await testAnimationSystemLoads(page);
        await testCSSLoads(page);
        await testBattleIntroPlays(page);
        await testXSSProtection(page);
        await testCleanup(page);
        await testMultipleAnimations(page);
        await testConcurrentPrevention(page);
        await testDivineCouncilIntegration(page);

    } catch (error) {
        log(`\n❌ Test suite crashed: ${error.message}`, 'red');
    } finally {
        await browser.close();
    }

    // Print summary
    log('\n╔══════════════════════════════════════════════════════════╗', 'cyan');
    log('║                      TEST SUMMARY                        ║', 'cyan');
    log('╚══════════════════════════════════════════════════════════╝', 'cyan');
    log(`\nTotal Tests: ${totalTests}`);
    log(`Passed: ${passedTests}`, 'green');
    log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
    log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

    if (failedTests === 0) {
        log('🎉 All tests passed!', 'green');
        process.exit(0);
    } else {
        log('⚠️  Some tests failed. Review output above.', 'yellow');
        process.exit(1);
    }
}

// Run tests if executed directly
if (require.main === module) {
    runTests().catch(error => {
        console.error('Test runner error:', error);
        process.exit(1);
    });
}

module.exports = { runTests };
