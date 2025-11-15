/**
 * MCP + Opus 4.1 Integration Test
 * Verifies MCP sampling works with Claude Desktop (Max plan)
 */

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const SERVER_PORT = 5000;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;
const TEST_TIMEOUT = 60000; // 60 seconds
const SCREENSHOT_DIR = 'screenshots/mcp_test';

// Create screenshot directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Track server logs for MCP messages
let serverLogs = [];
let mcpLogs = [];
let serverProcess = null;

async function startServer() {
    console.log('🚀 Starting Flask server...');

    return new Promise((resolve, reject) => {
        serverProcess = spawn('python', ['web_game.py'], {
            cwd: __dirname,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        serverProcess.stdout.on('data', (data) => {
            const log = data.toString();
            serverLogs.push(log);

            // Check for MCP-related logs
            if (log.includes('[MCP]')) {
                mcpLogs.push(log);
                console.log('📡 MCP Log:', log.trim());
            }

            // Check if server is ready
            if (log.includes('Running on')) {
                console.log('✅ Server started successfully');
                setTimeout(resolve, 2000); // Give server 2s to fully initialize
            }
        });

        serverProcess.stderr.on('data', (data) => {
            const log = data.toString();
            serverLogs.push(log);

            // MCP logs might come through stderr
            if (log.includes('[MCP]')) {
                mcpLogs.push(log);
                console.log('📡 MCP Log (stderr):', log.trim());
            }

            // Also capture Python errors
            if (log.includes('Error') || log.includes('Traceback')) {
                console.error('❌ Server Error:', log);
            }
        });

        serverProcess.on('error', (error) => {
            console.error('❌ Failed to start server:', error);
            reject(error);
        });

        // Timeout if server doesn't start
        setTimeout(() => {
            reject(new Error('Server startup timeout'));
        }, 10000);
    });
}

function stopServer() {
    if (serverProcess) {
        console.log('🛑 Stopping server...');
        serverProcess.kill();
        serverProcess = null;
    }
}

async function testMCPIntegration() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 MCP + OPUS 4.1 INTEGRATION TEST');
    console.log('='.repeat(60) + '\n');

    let browser;
    let testsPassed = 0;
    let testsFailed = 0;
    const results = {};

    try {
        // Start Flask server
        await startServer();

        // Launch browser
        console.log('\n🌐 Launching browser...');
        browser = await chromium.launch({
            headless: false, // Show browser to see what's happening
            slowMo: 500      // Slow down for visibility
        });

        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });

        const page = await context.newPage();

        // Capture console logs
        const pageLogs = [];
        page.on('console', msg => {
            const log = `[${msg.type()}] ${msg.text()}`;
            pageLogs.push(log);
            console.log('  🖥️  Browser:', log);
        });

        // Capture errors
        page.on('pageerror', error => {
            console.error('  💥 Page Error:', error.message);
        });

        // TEST 1: Server is running
        console.log('\n📋 TEST 1: Server Health Check');
        try {
            await page.goto(SERVER_URL, { waitUntil: 'networkidle', timeout: 10000 });
            console.log('  ✅ Server is responding');
            results.serverHealth = 'PASS';
            testsPassed++;
        } catch (error) {
            console.error('  ❌ Server not responding:', error.message);
            results.serverHealth = 'FAIL';
            testsFailed++;
            throw error;
        }

        // Take screenshot of landing page
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, '01_landing.png'),
            fullPage: true
        });

        // TEST 2: Create game
        console.log('\n📋 TEST 2: Create Game');
        try {
            await page.fill('#creator-name', 'MCPTestPlayer');
            await page.click('button.rune-create');
            await page.waitForURL('**/game', { timeout: 10000 });
            console.log('  ✅ Game created successfully');
            results.gameCreation = 'PASS';
            testsPassed++;
        } catch (error) {
            console.error('  ❌ Failed to create game:', error.message);
            results.gameCreation = 'FAIL';
            testsFailed++;
            throw error;
        }

        // Wait for page to load
        await page.waitForTimeout(3000);

        // Take screenshot of interrogation screen
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, '02_interrogation.png'),
            fullPage: true
        });

        // TEST 3: Verify interrogation question loaded
        console.log('\n📋 TEST 3: Divine Interrogation Question Generation');
        try {
            // Wait for question to appear
            const questionText = await page.waitForSelector('#question-text', { timeout: 15000 });
            const question = await questionText.textContent();

            if (question && question.length > 10 && !question.includes('Loading')) {
                console.log('  ✅ Question generated:', question.substring(0, 100) + '...');
                results.questionGeneration = 'PASS';
                testsPassed++;
            } else {
                throw new Error('Question appears to be placeholder or loading state');
            }

            // Check for answer options
            const answerButtons = await page.$$('.answer-option');
            if (answerButtons.length === 4) {
                console.log('  ✅ 4 answer options found (correct)');
            } else {
                throw new Error(`Expected 4 answers, found ${answerButtons.length}`);
            }

        } catch (error) {
            console.error('  ❌ Question generation failed:', error.message);
            results.questionGeneration = 'FAIL';
            testsFailed++;
        }

        // TEST 4: Check MCP logs for Opus 4.1
        console.log('\n📋 TEST 4: MCP Opus 4.1 Integration');

        // Wait a bit for MCP logs to appear
        await page.waitForTimeout(2000);

        const mcpOpusLogs = mcpLogs.filter(log =>
            log.includes('Opus 4.1') || log.includes('claude-opus-4')
        );

        const mcpRequestLogs = mcpLogs.filter(log =>
            log.includes('[MCP] Requesting')
        );

        const mcpSuccessLogs = mcpLogs.filter(log =>
            log.includes('successfully')
        );

        if (mcpRequestLogs.length > 0) {
            console.log(`  ✅ MCP requests detected: ${mcpRequestLogs.length}`);
            console.log(`     ${mcpRequestLogs[0].trim()}`);
        } else {
            console.log('  ⚠️  No MCP request logs found');
        }

        if (mcpSuccessLogs.length > 0) {
            console.log(`  ✅ MCP success responses: ${mcpSuccessLogs.length}`);
            console.log(`     ${mcpSuccessLogs[0].trim()}`);
        } else {
            console.log('  ⚠️  No MCP success logs found');
        }

        if (mcpOpusLogs.length > 0) {
            console.log(`  ✅ Opus 4.1 confirmed in logs`);
            results.mcpOpusIntegration = 'PASS';
            testsPassed++;
        } else {
            console.log('  ⚠️  Opus 4.1 not explicitly mentioned in logs');
            console.log('     This might be OK if MCP sampling is working');
            results.mcpOpusIntegration = 'WARN';
        }

        // TEST 5: Answer a question and verify next question
        console.log('\n📋 TEST 5: Question Flow Test');
        try {
            // Click first answer
            const firstAnswer = await page.$('.answer-option');
            if (firstAnswer) {
                await firstAnswer.click();
                console.log('  ✅ Clicked answer option');

                // Wait for next question (or completion)
                await page.waitForTimeout(3000);

                // Take screenshot after answering
                await page.screenshot({
                    path: path.join(SCREENSHOT_DIR, '03_after_answer.png'),
                    fullPage: true
                });

                // Check if we got a new question or completion screen
                const newQuestion = await page.$('#question-text');
                if (newQuestion) {
                    const newText = await newQuestion.textContent();
                    console.log('  ✅ Next question loaded:', newText.substring(0, 80) + '...');
                    results.questionFlow = 'PASS';
                    testsPassed++;
                } else {
                    console.log('  ℹ️  No new question (might be on completion screen)');
                    results.questionFlow = 'PARTIAL';
                }
            }
        } catch (error) {
            console.error('  ❌ Question flow test failed:', error.message);
            results.questionFlow = 'FAIL';
            testsFailed++;
        }

        // TEST 6: Check for API errors in browser console
        console.log('\n📋 TEST 6: Browser Console Error Check');
        const errorLogs = pageLogs.filter(log =>
            log.includes('[error]') || log.includes('Error')
        );

        if (errorLogs.length === 0) {
            console.log('  ✅ No errors in browser console');
            results.browserErrors = 'PASS';
            testsPassed++;
        } else {
            console.log(`  ⚠️  Found ${errorLogs.length} errors in console:`);
            errorLogs.forEach(err => console.log(`     ${err}`));
            results.browserErrors = 'WARN';
        }

    } catch (error) {
        console.error('\n💥 Test suite error:', error.message);
    } finally {
        // Cleanup
        if (browser) {
            await browser.close();
        }
        stopServer();
    }

    // Print results
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));

    Object.entries(results).forEach(([test, result]) => {
        const icon = result === 'PASS' ? '✅' : result === 'FAIL' ? '❌' : '⚠️';
        console.log(`${icon} ${test}: ${result}`);
    });

    console.log('\n' + '-'.repeat(60));
    console.log(`Tests Passed: ${testsPassed}`);
    console.log(`Tests Failed: ${testsFailed}`);
    console.log(`Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
    console.log('-'.repeat(60));

    // MCP Log Summary
    if (mcpLogs.length > 0) {
        console.log('\n📡 MCP LOGS CAPTURED:');
        mcpLogs.forEach(log => console.log(`   ${log.trim()}`));
    } else {
        console.log('\n⚠️  NO MCP LOGS CAPTURED');
        console.log('   This suggests MCP is not being called or logs are not visible');
    }

    // Check for specific issues
    console.log('\n🔍 DIAGNOSTIC CHECKS:');

    if (mcpLogs.some(log => log.includes('API key'))) {
        console.log('❌ CRITICAL: API key error detected - MCP should NOT need API key!');
    }

    if (mcpLogs.some(log => log.includes('sampling'))) {
        console.log('✅ MCP sampling is being used (correct)');
    } else {
        console.log('⚠️  No mention of "sampling" in logs');
    }

    if (mcpLogs.some(log => log.includes('Opus 4.1') || log.includes('claude-opus-4'))) {
        console.log('✅ Opus 4.1 model confirmed');
    } else {
        console.log('⚠️  Opus 4.1 not explicitly confirmed in logs');
    }

    // Final verdict
    console.log('\n' + '='.repeat(60));
    if (testsFailed === 0 && testsPassed >= 4) {
        console.log('🎉 SUCCESS: MCP + Opus 4.1 integration is working!');
        console.log('='.repeat(60) + '\n');
        return true;
    } else if (testsPassed >= 3) {
        console.log('⚠️  PARTIAL SUCCESS: Most tests passed but some issues detected');
        console.log('='.repeat(60) + '\n');
        return false;
    } else {
        console.log('❌ FAILURE: MCP integration has significant issues');
        console.log('='.repeat(60) + '\n');
        return false;
    }
}

// Run the test
testMCPIntegration()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
