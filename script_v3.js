// script_v3.js
document.addEventListener('DOMContentLoaded', initApp);

const API_BASE_URL = 'https://HuzaifaSaleh.pythonanywhere.com/api';


let ALL_USERS_DATA = [];
let EXERCISE_CATALOG_DATA = {};
let BODY_PARTS_LIST_DATA = [];
let FOOD_DB_SAMPLE_DATA = [];
let SELECTED_USER_PROFILE = null;
let SELECTED_USER_DAILY_RECORDS = {};
let SELECTED_USER_WORKOUT_LOGS_TODAY = [];

let selectedUser = null;
let todayDateString = getTodayDateString();

const userSelect = document.getElementById('userSelect');
const userPointsDisplay = document.getElementById('userPoints');
const userAgeInput = document.getElementById('userAge');
const userGenderSelect = document.getElementById('userGender');
const userWeightInput = document.getElementById('userWeight');
const userHeightInput = document.getElementById('userHeight');
const userTargetWeightInput = document.getElementById('userTargetWeight');
const userActivityLevelSelect = document.getElementById('userActivityLevel');
const updateProfileBtn = document.getElementById('updateProfileBtn');
const profileStatus = document.getElementById('profileStatus');
const currentDateDisplay = document.getElementById('currentDate');
const logStatus = document.getElementById('logStatus');
const intakeLogStatus = document.getElementById('intakeLogStatus');
const bodyPartChecklistDiv = document.getElementById('bodyPartChecklist');
const exercisesToLogContainer = document.getElementById('exercisesToLogContainer');
const addExerciseToLogBtn = document.getElementById('addExerciseToLogBtn');
const logWorkoutSessionBtn = document.getElementById('logWorkoutSessionBtn');
const dailyStepsInput = document.getElementById('dailyStepsInput');
const logStepsBtn = document.getElementById('logStepsBtn');
const manualFoodItemSelect = document.getElementById('manualFoodItemSelect');
const manualFoodNameInput = document.getElementById('manualFoodName');
const manualFoodCaloriesInput = document.getElementById('manualFoodCalories');
const logManualFoodBtn = document.getElementById('logManualFoodBtn');
const foodImageInput = document.getElementById('foodImageInput');
const uploadFoodImageBtn = document.getElementById('uploadFoodImageBtn');
const foodImageRecognitionResult = document.getElementById('foodImageRecognitionResult');
const recoCaloriesDisplay = document.getElementById('recoCaloriesDisplay');
const totalIntakeDisplay = document.getElementById('totalIntakeDisplay');
const workoutBurntDisplay = document.getElementById('workoutBurntDisplay');
const stepsBurntDisplay = document.getElementById('stepsBurntDisplay');
const netCaloriesDisplay = document.getElementById('netCaloriesDisplay');
const selectedUserNameDisplay = document.getElementById('selectedUserNameDisplay');
const currentUserLogDiv = document.getElementById('currentUserLog');
const teamActivityTableBody = document.getElementById('teamActivityTableBody');
const suggestExBodyPartSelect = document.getElementById('suggestExBodyPart');
const suggestExLevelSelect = document.getElementById('suggestExLevel');
const getExerciseSuggestionsBtn = document.getElementById('getExerciseSuggestionsBtn');
const exerciseSuggestionsListDiv = document.getElementById('exerciseSuggestionsList');
const targetRecoCaloriesSuggest = document.getElementById('targetRecoCaloriesSuggest');
const caloriesNeededSuggest = document.getElementById('caloriesNeededSuggest');
const foodSuggestionsListDiv = document.getElementById('foodSuggestionsList');
const fineUserNameDisplay = document.getElementById('fineUserNameDisplay');
const pendingFinesListDiv = document.getElementById('pendingFinesList');
const hostQuestionTextInput = document.getElementById('hostQuestionText');
const submitHostQuestionBtn = document.getElementById('submitHostQuestionBtn');
const hostQuestionStatus = document.getElementById('hostQuestionStatus');
const viewHostQuestionsSection = document.getElementById('viewHostQuestionsSection');
const hostQuestionsListDiv = document.getElementById('hostQuestionsList');
const currentYearSpan = document.getElementById('currentYear');
const triggerFineCheckBtn = document.getElementById('triggerFineCheckBtn');
// Modal elements for answering questions
const answerModal = document.getElementById('answerModal');
const answerModalUser = document.getElementById('answerModalUser');
const answerModalQuestionText = document.getElementById('answerModalQuestionText');
const answerModalTextarea = document.getElementById('answerModalTextarea');
const answerModalQuestionIdInput = document.getElementById('answerModalQuestionId'); // Corrected ID
const submitAnswerBtn = document.getElementById('submitAnswerBtn');


async function fetchData(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Network response was not ok or not JSON" }));
            console.error(`API Error (${response.status}): ${errorData.error || response.statusText} for ${API_BASE_URL}${endpoint}`);
            const generalStatusArea = document.getElementById('logStatus') || document.getElementById('profileStatus') || document.getElementById('intakeLogStatus') || hostQuestionStatus;
            if(generalStatusArea) {
                generalStatusArea.textContent = `Error: ${errorData.error || response.statusText}. Check console.`;
                generalStatusArea.className = 'status-text text-red-600';
            }
            return null; 
        }
        // For DELETE requests with no content, response.json() will fail.
        if (options.method === 'DELETE' && response.status === 200) { // Or 204 No Content
            return { success: true, message: "Deletion successful (assumed)" }; // Or parse if backend sends JSON
        }
        return response.json();
    } catch (error) {
        console.error('Fetch API error:', error);
        const generalStatusArea = document.getElementById('logStatus') || document.getElementById('profileStatus') || document.getElementById('intakeLogStatus') || hostQuestionStatus;
        if(generalStatusArea) {
            generalStatusArea.textContent = `Error: ${error.message}. Backend might be down. Check console.`;
            generalStatusArea.className = 'status-text text-red-600';
        }
        return null;
    }
}

function getTodayDateString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

async function initApp() {
    currentYearSpan.textContent = new Date().getFullYear();
    currentDateDisplay.textContent = new Date(todayDateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const initData = await fetchData('/init-data');
    if (!initData) {
        alert("Failed to load initial application data. Please check backend connection and refresh.");
        return;
    }
    ALL_USERS_DATA = initData.users;
    EXERCISE_CATALOG_DATA = initData.exercise_catalog;
    BODY_PARTS_LIST_DATA = initData.body_parts_list;
    FOOD_DB_SAMPLE_DATA = initData.food_database_sample;

    populateUserSelection();
    populateBodyPartChecklist();
    populateExerciseDropdowns(); 
    populateFoodItemDropdown(); 
    populateSuggestionFilters();

    userSelect.addEventListener('change', handleUserChange);
    updateProfileBtn.addEventListener('click', handleUpdateProfile);
    addExerciseToLogBtn.addEventListener('click', addExerciseLogItem);
    logWorkoutSessionBtn.addEventListener('click', handleLogWorkoutSession);
    logStepsBtn.addEventListener('click', handleLogSteps);
    logManualFoodBtn.addEventListener('click', handleLogManualFood);
    uploadFoodImageBtn.addEventListener('click', handleUploadFoodImage_Simulated);
    getExerciseSuggestionsBtn.addEventListener('click', fetchAndDisplayExerciseSuggestions);
    submitHostQuestionBtn.addEventListener('click', handleSubmitHostQuestion);
    triggerFineCheckBtn.addEventListener('click', () => fetchData('/fines/check', { method: 'POST' }).then(res => alert(res ? res.message : "Error triggering fine check.")));
    
    submitAnswerBtn.addEventListener('click', handleSubmitAnswer); // Listener for modal submit

    if (ALL_USERS_DATA.length > 0) {
        selectedUser = ALL_USERS_DATA[0].name;
        userSelect.value = selectedUser;
        await handleUserChange(); 
    }
    document.querySelector('.tab-button').click(); // Open first tab
}

function populateUserSelection() {
    userSelect.innerHTML = ALL_USERS_DATA.map(user => `<option value="${user.name}">${user.name}</option>`).join('');
}

function populateBodyPartChecklist() {
    bodyPartChecklistDiv.innerHTML = BODY_PARTS_LIST_DATA.map(bp => `
        <label class="flex items-center space-x-2 text-sm">
            <input type="checkbox" name="bodyPartTrained" value="${bp}" class="form-checkbox h-3 w-3 sm:h-4 sm:w-4 text-indigo-600">
            <span>${bp}</span>
        </label>
    `).join('');
}

function populateExerciseDropdowns(selectElement) {
    const options = Object.keys(EXERCISE_CATALOG_DATA).map(exName => `<option value="${exName}">${exName}</option>`).join('');
    if(selectElement) {
        selectElement.innerHTML = `<option value="">-- Select Exercise --</option>${options}`;
    }
}
function populateFoodItemDropdown() {
    manualFoodItemSelect.innerHTML = '<option value="">-- Select Food --</option>' +
        FOOD_DB_SAMPLE_DATA.map(food => `<option value="${food.name}" data-calories="${food.calories}">${food.name} (${food.calories} kcal)</option>`).join('');
    
    manualFoodItemSelect.addEventListener('change', (e) => {
        const selectedOption = e.target.selectedOptions[0];
        if (selectedOption && selectedOption.value) {
            manualFoodNameInput.value = selectedOption.value;
            manualFoodCaloriesInput.value = selectedOption.dataset.calories;
        } else {
            manualFoodNameInput.value = '';
            manualFoodCaloriesInput.value = '';
        }
    });
}

function populateSuggestionFilters() {
    suggestExBodyPartSelect.innerHTML = '<option value="">All Body Parts</option>' +
        BODY_PARTS_LIST_DATA.map(bp => `<option value="${bp}">${bp}</option>`).join('');
}

async function handleUserChange() {
    selectedUser = userSelect.value;
    if (!selectedUser) return;

    clearDynamicDisplays();

    SELECTED_USER_PROFILE = await fetchData(`/user/${selectedUser}/profile`);
    if (!SELECTED_USER_PROFILE) { alert("Failed to load user profile."); return; }

    const todayLogs = await fetchData(`/userlog/${selectedUser}/${todayDateString}`);
    if(todayLogs){
        SELECTED_USER_WORKOUT_LOGS_TODAY = todayLogs.workouts_logged || [];
        SELECTED_USER_DAILY_RECORDS[todayDateString] = todayLogs.daily_tracking || createEmptyDailyRecord();
    } else {
        SELECTED_USER_WORKOUT_LOGS_TODAY = [];
        SELECTED_USER_DAILY_RECORDS[todayDateString] = createEmptyDailyRecord();
    }

    updateProfileInputs();
    updatePointsDisplay();
    await updateCalorieSummary();
    displayCurrentUserLogsForToday();
    await displayTeamActivity();
    await fetchAndDisplayUserFines();
    
    if(SELECTED_USER_PROFILE.profile && SELECTED_USER_PROFILE.profile.is_host) { // Check if profile exists
        viewHostQuestionsSection.classList.remove('hidden');
        await fetchAndDisplayHostQuestions();
    } else {
        viewHostQuestionsSection.classList.add('hidden');
        hostQuestionsListDiv.innerHTML = ''; // Clear questions if not host
    }
    selectedUserNameDisplay.textContent = selectedUser;
    fineUserNameDisplay.textContent = selectedUser;
}

function createEmptyDailyRecord() {
    return { steps_taken: 0, calories_intake_manual: 0, food_log: [], steps_calories_burned: 0 };
}

function clearDynamicDisplays() {
    profileStatus.textContent = '';
    logStatus.textContent = '';
    intakeLogStatus.textContent = '';
    currentUserLogDiv.innerHTML = '<p class="text-gray-500 text-sm">Loading data...</p>';
    recoCaloriesDisplay.textContent = '-';
    totalIntakeDisplay.textContent = '-';
    workoutBurntDisplay.textContent = '-';
    stepsBurntDisplay.textContent = '-';
    netCaloriesDisplay.textContent = '-';
    hostQuestionsListDiv.innerHTML = '';
    viewHostQuestionsSection.classList.add('hidden');
    exercisesToLogContainer.innerHTML = ''; // Clear dynamic exercise inputs
     document.querySelectorAll('#bodyPartChecklist input:checked').forEach(cb => cb.checked = false);
}

function updateProfileInputs() {
    if (!SELECTED_USER_PROFILE || !SELECTED_USER_PROFILE.profile) return;
    const profile = SELECTED_USER_PROFILE.profile;
    userAgeInput.value = profile.age || '';
    userGenderSelect.value = profile.gender || '';
    userWeightInput.value = profile.weight_kg || '';
    userHeightInput.value = profile.height_cm || '';
    userTargetWeightInput.value = profile.target_weight_kg || '';
    userActivityLevelSelect.value = profile.activity_level || 'sedentary';
}

function updatePointsDisplay() {
     userPointsDisplay.textContent = SELECTED_USER_PROFILE ? SELECTED_USER_PROFILE.points || 0 : 0;
}

async function handleUpdateProfile() {
    if (!selectedUser) return;
    const payload = {
        age: parseInt(userAgeInput.value) || null,
        gender: userGenderSelect.value || null,
        weight_kg: parseFloat(userWeightInput.value) || null,
        height_cm: parseFloat(userHeightInput.value) || null,
        target_weight_kg: parseFloat(userTargetWeightInput.value) || null,
        activity_level: userActivityLevelSelect.value || 'sedentary'
    };

    const result = await fetchData(`/user/${selectedUser}/profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });

    if (result && !result.error) {
        profileStatus.textContent = 'Profile updated successfully!';
        profileStatus.className = 'status-text text-green-600';
        SELECTED_USER_PROFILE = result;
        await updateCalorieSummary();
    } else {
        profileStatus.textContent = result ? result.error : 'Failed to update profile.';
        profileStatus.className = 'status-text text-red-600';
    }
    setTimeout(() => profileStatus.textContent = '', 3000);
}

function addExerciseLogItem() {
    const itemId = `exlog-${Date.now()}`;
    const itemHtml = `
        <div id="${itemId}" class="exercise-log-item">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-xs font-medium">Exercise:</label>
                    <select name="exerciseName" class="w-full p-1 border rounded text-xs common-input"></select>
                </div>
                <div>
                    <label class="block text-xs font-medium">Duration (minutes):</label>
                    <input type="number" name="exerciseDuration" placeholder="e.g., 15" class="w-full p-1 border rounded text-xs common-input">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-1">
                 <div><label class="block text-xs font-medium">Sets (optional):</label><input type="number" name="exerciseSets" placeholder="e.g., 3" class="w-full p-1 border rounded text-xs common-input"></div>
                 <div><label class="block text-xs font-medium">Reps (optional):</label><input type="number" name="exerciseReps" placeholder="e.g., 10" class="w-full p-1 border rounded text-xs common-input"></div>
            </div>
            <button onclick="document.getElementById('${itemId}').remove()" class="mt-2 text-xs text-red-500 hover:text-red-700">Remove</button>
        </div>`;
    exercisesToLogContainer.insertAdjacentHTML('beforeend', itemHtml);
    populateExerciseDropdowns(document.querySelector(`#${itemId} select[name="exerciseName"]`));
}

async function handleLogWorkoutSession() {
    if (!selectedUser) { logStatus.textContent = "Select user!"; logStatus.className = 'status-text text-red-500'; return; }

    const loggedExercises = [];
    document.querySelectorAll('.exercise-log-item').forEach(item => {
        const name = item.querySelector('select[name="exerciseName"]').value;
        const duration = parseInt(item.querySelector('input[name="exerciseDuration"]').value);
        const sets = item.querySelector('input[name="exerciseSets"]').value;
        const reps = item.querySelector('input[name="exerciseReps"]').value;
        if (name && duration > 0) {
            loggedExercises.push({ name, duration_minutes: duration, sets: sets ? parseInt(sets) : null, reps: reps ? parseInt(reps) : null });
        }
    });

    if (loggedExercises.length === 0) {
        logStatus.textContent = 'Please add at least one exercise with duration.';
        logStatus.className = 'status-text text-red-600';
        setTimeout(() => logStatus.textContent = '', 3000);
        return;
    }

    const selectedBodyParts = Array.from(document.querySelectorAll('#bodyPartChecklist input:checked')).map(cb => cb.value);

    const payload = { user: selectedUser, date: todayDateString, exercises_done: loggedExercises, bodyPartsTrained: selectedBodyParts };
    const result = await fetchData('/workout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

    if (result && result.message) {
        logStatus.textContent = result.message;
        logStatus.className = 'status-text text-green-600';
        exercisesToLogContainer.innerHTML = '';
        document.querySelectorAll('#bodyPartChecklist input:checked').forEach(cb => cb.checked = false);
        
        if(result.user_points && SELECTED_USER_PROFILE) SELECTED_USER_PROFILE.points = result.user_points;
        if(result.logged_data) SELECTED_USER_WORKOUT_LOGS_TODAY.push(result.logged_data);
        
        updatePointsDisplay();
        displayCurrentUserLogsForToday();
        await updateCalorieSummary();
        await displayTeamActivity();
        await fetchAndDisplayUserFines();
    } else {
        logStatus.textContent = result ? result.error : 'Failed to log workout session.';
        logStatus.className = 'status-text text-red-600';
    }
    setTimeout(() => logStatus.textContent = '', 4000);
}

async function handleLogSteps() {
    if (!selectedUser) { intakeLogStatus.textContent = "Select user!"; intakeLogStatus.className = 'status-text text-red-500'; return; }
    const steps = parseInt(dailyStepsInput.value);
    if (isNaN(steps) || steps < 0) {
        intakeLogStatus.textContent = 'Invalid steps count.'; intakeLogStatus.className = 'status-text text-red-600';
        setTimeout(() => intakeLogStatus.textContent = '', 3000); return;
    }
    const payload = { steps_taken: steps };
    const result = await fetchData(`/user/${selectedUser}/daily-record/${todayDateString}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (result && !result.error) {
        intakeLogStatus.textContent = `Steps logged: ${steps}.`; intakeLogStatus.className = 'status-text text-green-600';
        SELECTED_USER_DAILY_RECORDS[todayDateString] = {...(SELECTED_USER_DAILY_RECORDS[todayDateString] || createEmptyDailyRecord()), ...result};
        await updateCalorieSummary();
        displayCurrentUserLogsForToday();
    } else {
        intakeLogStatus.textContent = result ? result.error : 'Failed to log steps.'; intakeLogStatus.className = 'status-text text-red-600';
    }
     setTimeout(() => intakeLogStatus.textContent = '', 3000);
}

async function handleLogManualFood() {
    if (!selectedUser) { intakeLogStatus.textContent = "Select user!"; intakeLogStatus.className = 'status-text text-red-500'; return; }
    const name = manualFoodNameInput.value.trim();
    const calories = parseInt(manualFoodCaloriesInput.value);

    if (!name || isNaN(calories) || calories <= 0) {
        intakeLogStatus.textContent = 'Valid food name and positive calories required.'; intakeLogStatus.className = 'status-text text-red-600';
        setTimeout(() => intakeLogStatus.textContent = '', 3000); return;
    }
    const payload = { food_item: { name, calories } };
    const result = await fetchData(`/user/${selectedUser}/daily-record/${todayDateString}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (result && !result.error) {
        intakeLogStatus.textContent = `${name} (${calories} kcal) logged.`; intakeLogStatus.className = 'status-text text-green-600';
        SELECTED_USER_DAILY_RECORDS[todayDateString] = {...(SELECTED_USER_DAILY_RECORDS[todayDateString] || createEmptyDailyRecord()), ...result};
        manualFoodNameInput.value = ''; manualFoodCaloriesInput.value = ''; manualFoodItemSelect.value = '';
        await updateCalorieSummary();
        displayCurrentUserLogsForToday();
        await updateFoodSuggestions();
    } else {
        intakeLogStatus.textContent = result ? result.error : 'Failed to log food.'; intakeLogStatus.className = 'status-text text-red-600';
    }
    setTimeout(() => intakeLogStatus.textContent = '', 3000);
}

async function handleUploadFoodImage_Simulated() {
    const file = foodImageInput.files[0];
    if (!file) { foodImageRecognitionResult.textContent = 'Please select an image file.'; return; }
    foodImageRecognitionResult.textContent = 'Simulating recognition...';
    
    const result = await fetchData('/food-recognize-placeholder', { method: 'POST' }); 
    if (result && result.recognized_items) {
        foodImageRecognitionResult.innerHTML = `<strong>${result.message}</strong><br/>` +
            result.recognized_items.map(item => 
                `${item.name} (~${item.calories} kcal) - Conf: ${(item.confidence * 100).toFixed(0)}% 
                 <button class="text-xxs text-green-600 hover:underline" onclick="logRecognizedFood('${item.name.replace(/'/g, "\\'")}', ${item.calories})">Log this</button>`
            ).join('<br/>');
    } else {
        foodImageRecognitionResult.textContent = 'Recognition failed (placeholder).';
    }
    foodImageInput.value = ''; // Clear file input
}

async function logRecognizedFood(name, calories) {
    manualFoodNameInput.value = name;
    manualFoodCaloriesInput.value = calories;
    await handleLogManualFood();
    foodImageRecognitionResult.textContent = `${name} logged!`;
    setTimeout(() => foodImageRecognitionResult.textContent = '', 3000);
}

async function updateCalorieSummary() {
    if (!SELECTED_USER_PROFILE || !SELECTED_USER_PROFILE.profile || !SELECTED_USER_PROFILE.profile.weight_kg) {
        recoCaloriesDisplay.textContent = '- (Update profile)'; totalIntakeDisplay.textContent = '-'; workoutBurntDisplay.textContent = '-'; stepsBurntDisplay.textContent = '-'; netCaloriesDisplay.textContent = '-';
        await updateFoodSuggestions(0,0); // Call with 0 to show default message or handle appropriately
        return;
    }

    const recoData = await fetchData(`/user/${selectedUser}/recommended-calories`);
    let recommendedIntake = 0;
    if (recoData && recoData.recommended_daily_calories) {
        recommendedIntake = recoData.recommended_daily_calories;
        recoCaloriesDisplay.textContent = recommendedIntake;
    } else {
        recoCaloriesDisplay.textContent = '- (Error/Profile Incomplete)';
    }

    const dailyRecToday = SELECTED_USER_DAILY_RECORDS[todayDateString] || createEmptyDailyRecord();
    const totalIntake = dailyRecToday.calories_intake_manual || 0;
    totalIntakeDisplay.textContent = totalIntake;

    const totalWorkoutCalories = SELECTED_USER_WORKOUT_LOGS_TODAY.reduce((sum, workout) => sum + (workout.total_calories_burned || 0), 0);
    workoutBurntDisplay.textContent = totalWorkoutCalories;
    
    const stepsCalories = dailyRecToday.steps_calories_burned || 0;
    stepsBurntDisplay.textContent = stepsCalories;
    
    const net = totalIntake - totalWorkoutCalories - stepsCalories;
    netCaloriesDisplay.textContent = net;
    const netDisplayClasses = ['font-bold'];
    if (recommendedIntake > 0) { // Only color if recommendation is available
        if (net > recommendedIntake + 100) netDisplayClasses.push('text-orange-500'); // Significantly over
        else if (net < recommendedIntake - 100) netDisplayClasses.push('text-blue-500'); // Significantly under
        else netDisplayClasses.push('text-green-600'); // Around target
    }
    netCaloriesDisplay.className = netDisplayClasses.join(' ');
    
    await updateFoodSuggestions(recommendedIntake, totalIntake);
}

async function updateFoodSuggestions(recommendedIntake, currentIntake) {
    targetRecoCaloriesSuggest.textContent = recommendedIntake || '-';
    const needed = (recommendedIntake || 0) - (currentIntake || 0);
    caloriesNeededSuggest.textContent = needed > 0 ? `${needed}` : `0 (Goal Met/Exceeded)`;

    foodSuggestionsListDiv.innerHTML = '';
    if (needed <= 0 && recommendedIntake > 0) { // Only if goal is set and met
        foodSuggestionsListDiv.innerHTML = '<p class="text-xs">You have met or exceeded your calorie target for today!</p>';
        return;
    }
    if (recommendedIntake <=0 && needed <=0) { // No recommendation set or already at 0 needed
         foodSuggestionsListDiv.innerHTML = '<p class="text-xs">Update profile for calorie goal and suggestions.</p>';
        return;
    }


    const suggestions = FOOD_DB_SAMPLE_DATA
        .filter(food => food.calories <= needed && food.calories > 0)
        .sort((a, b) => b.calories - a.calories)
        .slice(0, 5);

    if (suggestions.length > 0) {
        suggestions.forEach(food => {
            foodSuggestionsListDiv.innerHTML += `<p class="text-xs py-0.5">${food.name} (~${food.calories} kcal) - <button class="text-xxs text-green-600 hover:underline" onclick="quickLogFood('${food.name.replace(/'/g, "\\'")}', ${food.calories})">Quick Log</button></p>`;
        });
    } else {
        foodSuggestionsListDiv.innerHTML = `<p class="text-xs">No specific small items match the remaining ${needed} kcal. Consider a balanced meal or smaller portions of items from the list.</p>`;
    }
}

async function quickLogFood(name, calories) {
    manualFoodNameInput.value = name;
    manualFoodCaloriesInput.value = calories;
    await handleLogManualFood();
}

function displayCurrentUserLogsForToday() {
    currentUserLogDiv.innerHTML = '';
    let content = '<p class="text-gray-500 text-sm">No activity recorded for today.</p>'; // Default

    let activityContent = '';

    if (SELECTED_USER_WORKOUT_LOGS_TODAY.length > 0) {
        activityContent += '<h3 class="text-base font-semibold text-gray-700 mb-1">Workout Sessions:</h3>';
        SELECTED_USER_WORKOUT_LOGS_TODAY.forEach(workout => {
            activityContent += `<div class="p-2 border rounded mb-2 text-xs bg-gray-50 shadow-sm">
                <p><strong>Body Parts:</strong> ${workout.bodyPartsTrained.join(', ') || 'N/A'}</p>
                <p><strong>Total Duration:</strong> ${workout.total_duration_minutes} mins</p>
                <p><strong>Total Calories Burnt:</strong> ${workout.total_calories_burned} kcal</p>
                <ul class="list-disc list-inside ml-2 mt-1 space-y-0.5">
                    ${workout.exercises_done.map(ex => `<li>${ex.name} (${ex.duration_minutes} min) - ${ex.calories_burned} kcal ${ex.sets ? `(${ex.sets} sets, ${ex.reps || '-'} reps)` : ''}</li>`).join('')}
                </ul>
            </div>`;
        });
    }

    const dailyRecToday = SELECTED_USER_DAILY_RECORDS[todayDateString] || createEmptyDailyRecord();
    if (dailyRecToday.steps_taken > 0 || dailyRecToday.food_log.length > 0 || activityContent) { // Only show if there's something to show for daily
        activityContent += '<h3 class="text-base font-semibold text-gray-700 mt-3 mb-1">Daily Tracking:</h3>';
        activityContent += `<p class="text-xs"><strong>Steps Taken:</strong> ${dailyRecToday.steps_taken || 0} (Burnt: ~${dailyRecToday.steps_calories_burned || 0} kcal)</p>`;
        activityContent += `<p class="text-xs"><strong>Manual Calories Intake:</strong> ${dailyRecToday.calories_intake_manual || 0} kcal</p>`;
        if (dailyRecToday.food_log && dailyRecToday.food_log.length > 0) {
            activityContent += '<p class="text-xs font-medium mt-1">Food Log:</p><ul class="list-disc list-inside ml-2 text-xs space-y-0.5">';
            dailyRecToday.food_log.forEach(food => { activityContent += `<li>${food.name} (${food.calories} kcal)</li>`; });
            activityContent += '</ul>';
        }
    }
    
    if(activityContent) content = activityContent;
    currentUserLogDiv.innerHTML = content;
}

async function displayTeamActivity() {
    const teamActivity = await fetchData(`/activity/${todayDateString}`);
    teamActivityTableBody.innerHTML = '';
    if (!teamActivity || teamActivity.length === 0) {
        teamActivityTableBody.innerHTML = `<tr><td colspan="4" class="px-3 py-3 text-center text-gray-500 text-sm">No team activity.</td></tr>`; return;
    }
    teamActivity.forEach(activity => {
        const row = teamActivityTableBody.insertRow();
        row.innerHTML = `
            <td class="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm">${activity.user}</td>
            <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm">${activity.exercises_summary || '-'}</td>
            <td class="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm">${activity.total_duration_minutes || '-'} min</td>
            <td class="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm">${activity.total_calories_burned || '-'} kcal</td>`;
    });
}

async function fetchAndDisplayExerciseSuggestions() {
    const bodyPart = suggestExBodyPartSelect.value;
    const level = suggestExLevelSelect.value;
    exerciseSuggestionsListDiv.innerHTML = '<p class="text-xs">Loading suggestions...</p>';

    const suggestions = await fetchData(`/exercise-suggestions?body_part=${bodyPart}&level=${level}`);
    if (suggestions && suggestions.length > 0) {
        exerciseSuggestionsListDiv.innerHTML = suggestions.map(sugg => `
            <div class="p-1.5 border-b">
                <p class="font-semibold text-xs">${sugg.name} <span class="text-gray-500 text-xxs">(MET: ${sugg.met})</span></p>
                <p class="text-gray-600 text-xs">${sugg.suggestion_for_level}</p>
                <p class="text-xxs text-indigo-500">Targets: ${sugg.body_parts.join(', ')}</p>
            </div>`).join('');
    } else {
        exerciseSuggestionsListDiv.innerHTML = '<p class="text-xs">No specific suggestions found. Try broader filters.</p>';
    }
}

async function fetchAndDisplayUserFines() {
    if (!selectedUser) return;
    const fines = await fetchData(`/fines/${selectedUser}`);
    pendingFinesListDiv.innerHTML = '';
    let hasPendingFines = false;
    if (fines && fines.length > 0) {
        fines.forEach(fine => {
            if (fine.status === 'pending') {
                hasPendingFines = true;
                const fineDiv = document.createElement('div');
                fineDiv.className = 'p-2 border border-red-300 rounded bg-red-50 text-xs shadow-sm';
                fineDiv.innerHTML = `
                    <p><strong>Date:</strong> ${fine.date_charged} | <strong>Amount:</strong> ${fine.amount} Rupees</p>
                    <p><strong>Reason:</strong> ${fine.reason}</p>
                    <button data-fine-id="${fine.fine_id}" class="pay-fine-btn mt-1 text-xxs bg-green-500 hover:bg-green-600 text-white py-0.5 px-1.5 rounded">Mark Paid</button>`;
                pendingFinesListDiv.appendChild(fineDiv);
            }
        });
        document.querySelectorAll('.pay-fine-btn').forEach(btn => {
            btn.addEventListener('click', async (event) => {
                const fineId = event.target.dataset.fineId;
                const result = await fetchData(`/fines/pay/${fineId}`, { method: 'POST' });
                alert(result ? result.message : "Error paying fine.");
                if (result && result.message) await fetchAndDisplayUserFines();
            });
        });
    }
    if (!hasPendingFines) {
        pendingFinesListDiv.innerHTML = `<p class="text-gray-500 text-xs">No pending fines for ${selectedUser}.</p>`;
    }
}

async function handleSubmitHostQuestion() {
    const questionText = hostQuestionTextInput.value.trim();
    if (!selectedUser || !questionText) {
        hostQuestionStatus.textContent = "Please type your question."; hostQuestionStatus.className = 'status-text text-red-500';
        setTimeout(() => hostQuestionStatus.textContent = '', 3000); return;
    }
    const payload = { user: selectedUser, question_text: questionText };
    const result = await fetchData('/ask-host', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (result && result.message) {
        hostQuestionStatus.textContent = result.message; hostQuestionStatus.className = 'status-text text-green-600';
        hostQuestionTextInput.value = '';
        if (SELECTED_USER_PROFILE && SELECTED_USER_PROFILE.profile && SELECTED_USER_PROFILE.profile.is_host) await fetchAndDisplayHostQuestions();
    } else {
        hostQuestionStatus.textContent = result ? result.error : "Failed to submit question."; hostQuestionStatus.className = 'status-text text-red-500';
    }
    setTimeout(() => hostQuestionStatus.textContent = '', 3000);
}

async function fetchAndDisplayHostQuestions() {
    if (!SELECTED_USER_PROFILE || !SELECTED_USER_PROFILE.profile || !SELECTED_USER_PROFILE.profile.is_host) {
        hostQuestionsListDiv.innerHTML = ''; return;
    }
    const questions = await fetchData(`/host-questions?user=${selectedUser}`);
    hostQuestionsListDiv.innerHTML = '';
    if (questions && questions.length > 0) {
        questions.forEach(q => {
            let answerSection = '';
            if (q.answer_text) {
                answerSection = `
                    <div class="mt-1.5 pt-1.5 border-t border-gray-200">
                        <p class="text-xs font-semibold text-indigo-600">Host Answer <span class="text-gray-400 text-xxs">(${new Date(q.answered_at || q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>:</p>
                        <p class="text-xs text-gray-700 whitespace-pre-wrap">${q.answer_text}</p>
                    </div>`;
            }
            const managementButtons = `
                <div class="mt-1.5 flex space-x-2">
                    <button class="text-xxs bg-blue-500 hover:bg-blue-600 text-white py-0.5 px-1.5 rounded" 
                            onclick="openAnswerModal('${q.id}', \`${q.question_text.replace(/`/g, '\\`')}\`, \`${q.user}\`, \`${(q.answer_text || '').replace(/`/g, '\\`')}\`)">
                        ${q.answer_text ? 'Edit Answer' : 'Answer'}
                    </button>
                    <button class="text-xxs bg-red-500 hover:bg-red-600 text-white py-0.5 px-1.5 rounded" 
                            onclick="handleDeleteQuestion('${q.id}')">Delete</button>
                </div>`;
            hostQuestionsListDiv.innerHTML += `
                <div class="p-2 border rounded mb-2 bg-gray-50 shadow-sm">
                    <div class="flex justify-between items-start"><p class="font-medium text-sm">${q.user}</p><span class="text-gray-400 text-xxs">${new Date(q.timestamp).toLocaleString()}</span></div>
                    <p class="text-sm text-gray-800 my-1 whitespace-pre-wrap">${q.question_text}</p>
                    <p class="text-indigo-700 text-xs font-medium">Status: <span class="capitalize font-semibold">${q.status}</span></p>
                    ${answerSection}${managementButtons}</div>`;
        });
    } else if (questions) {
        hostQuestionsListDiv.innerHTML = '<p class="text-sm text-gray-500">No questions submitted yet.</p>';
    } else {
        hostQuestionsListDiv.innerHTML = '<p class="text-sm text-red-500">Could not load questions.</p>';
    }
}

function openAnswerModal(questionId, questionText, questionUser, currentAnswerText = '') {
    answerModalQuestionIdInput.value = questionId; // Ensure this is the correct ID for the hidden input
    answerModalUser.textContent = questionUser;
    answerModalQuestionText.textContent = questionText;
    answerModalTextarea.value = currentAnswerText;
    answerModal.style.display = 'block';
}

async function handleSubmitAnswer() {
    const questionId = answerModalQuestionIdInput.value; // Corrected ID
    const answerText = answerModalTextarea.value.trim();

    if (!questionId || !answerText) { alert("Answer text cannot be empty."); return; }

    const payload = { answer_text: answerText, status: "answered" };
    const result = await fetchData(`/host-questions/${questionId}?requesting_user=${selectedUser}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });

    if (result && result.message) {
        // alert(result.message); // Can be removed for smoother UX
        answerModal.style.display = 'none';
        await fetchAndDisplayHostQuestions();
    } else {
        alert(result ? result.error : "Failed to submit answer. Ensure you are authorized.");
    }
}

async function handleDeleteQuestion(questionId) {
    if (!confirm('Are you sure you want to delete this question permanently?')) return;

    const result = await fetchData(`/host-questions/${questionId}?requesting_user=${selectedUser}`, { method: 'DELETE' });

    // Check if result is not null before accessing properties
    if (result && result.message) {
        // alert(result.message); // Can be removed for smoother UX
        await fetchAndDisplayHostQuestions();
    } else if (result && result.error) {
        alert(result.error);
    } else if (!result && typeof result !== 'object') { // Specifically check for non-object nulls or other falsy values from fetchData's error handling
        console.error("Delete operation failed, fetchData returned non-object or null:", result);
        alert("Failed to delete question due to a network or server error. Check console.");
    } else {
         // Fallback for unexpected responses if fetchData returns an object without message/error for DELETE
        alert("Failed to delete question. Ensure you are authorized or check server logs.");
    }
}