/* ==================================================
   TASKBLOOM
   FRONTEND JAVASCRIPT
   Flask + SQLite Backend
================================================== */


/* ==================================================
   GLOBAL VARIABLES
================================================== */

let tasks = [];

let editingId = null;


/* ==================================================
   AUTHENTICATION
================================================== */


/* ================= SHOW SIGNUP ================= */

function showSignup() {

    document
        .getElementById("loginPage")
        .classList
        .add("hidden");

    document
        .getElementById("signupPage")
        .classList
        .remove("hidden");

    document
        .getElementById("loginMessage")
        .textContent = "";

}


/* ================= SHOW LOGIN ================= */

function showLogin() {

    document
        .getElementById("signupPage")
        .classList
        .add("hidden");

    document
        .getElementById("loginPage")
        .classList
        .remove("hidden");

    document
        .getElementById("signupMessage")
        .textContent = "";

}


/* ==================================================
   SIGNUP
================================================== */

async function createAccount() {


    const name =
        document
            .getElementById("signupName")
            .value
            .trim();


    const email =
        document
            .getElementById("signupEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("signupPassword")
            .value;


    const confirmPassword =
        document
            .getElementById("signupConfirmPassword")
            .value;


    const message =
        document
            .getElementById("signupMessage");



    /* ---------- VALIDATION ---------- */

    if (
        !name ||
        !email ||
        !password ||
        !confirmPassword
    ) {

        message.textContent =
            "Please fill all fields.";

        message.style.color =
            "#d94b62";

        return;

    }



    if (
        password !==
        confirmPassword
    ) {

        message.textContent =
            "Passwords do not match.";

        message.style.color =
            "#d94b62";

        return;

    }



    if (
        password.length < 8
    ) {

        message.textContent =
            "Password must be at least 8 characters.";

        message.style.color =
            "#d94b62";

        return;

    }



    /* ---------- SEND TO FLASK ---------- */

    try {


        const response =
            await fetch(
                "/signup",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        email: email,

                        password: password,

                        confirm_password:
                            confirmPassword

                    })

                }
            );



        const data =
            await response.json();



        /* ---------- ERROR ---------- */

        if (!response.ok) {

            message.textContent =
                data.message ||
                "Unable to create account.";

            message.style.color =
                "#d94b62";

            return;

        }



        /* ---------- SUCCESS ---------- */

        message.textContent =
            "Account created successfully!";

        message.style.color =
            "#4b9b72";



        /*
            Automatically put email
            into login form.
        */

        document
            .getElementById("loginEmail")
            .value =
            email;



        setTimeout(
            function () {

                showLogin();

            },
            1000
        );


    }

    catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to server.";

        message.style.color =
            "#d94b62";

    }

}


/* ==================================================
   LOGIN
================================================== */

async function loginUser() {


    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("loginPassword")
            .value;


    const message =
        document
            .getElementById("loginMessage");



    /* ---------- VALIDATION ---------- */

    if (
        !email ||
        !password
    ) {

        message.textContent =
            "Please enter email and password.";

        message.style.color =
            "#d94b62";

        return;

    }



    /* ---------- SEND TO FLASK ---------- */

    try {


        const response =
            await fetch(
                "/login",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        email: email,

                        password: password

                    })

                }
            );



        const data =
            await response.json();



        /* ---------- INVALID LOGIN ---------- */

        if (!response.ok) {

            message.textContent =
                data.message ||
                "Invalid email or password.";

            message.style.color =
                "#d94b62";

            return;

        }



        /* ---------- SUCCESS ---------- */

        message.textContent = "";



        openApplication(
            data.name
        );


    }

    catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to server.";

        message.style.color =
            "#d94b62";

    }

}


/* ==================================================
   OPEN MAIN APPLICATION
================================================== */

async function openApplication(name) {


    document
        .getElementById("authScreen")
        .classList
        .add("hidden");


    document
        .getElementById("mainApp")
        .classList
        .remove("hidden");



    /* ---------- USER NAME ---------- */

    document
        .getElementById("profileName")
        .textContent =
        name;



    /* ---------- AVATAR ---------- */

    document
        .getElementById("profileAvatar")
        .textContent =
        name
            .charAt(0)
            .toUpperCase();



    /* ---------- PAGE TITLE ---------- */

    
    const firstName = name.trim().split(" ")[0];
    document
        .getElementById("pageTitle")
        .textContent =
         `Hello, ${firstName} 👋`;


    /* ---------- LOAD TASKS ---------- */

    await loadTasks();

}


/* ==================================================
   CHECK LOGIN WHEN PAGE LOADS
================================================== */

async function checkLogin() {


    try {


        const response =
            await fetch(
                "/current-user"
            );


        const data =
            await response.json();



        if (
            data.logged_in
        ) {

            openApplication(
                data.name
            );

        }

    }

    catch (error) {

        console.error(
            "Login check failed:",
            error
        );

    }

}


/* ==================================================
   LOGOUT
================================================== */

async function logoutUser() {


    try {


        await fetch(
            "/logout",
            {
                method: "POST"
            }
        );


    }

    catch (error) {

        console.error(error);

    }



    /* ---------- CLEAR UI ---------- */

    document
        .getElementById("mainApp")
        .classList
        .add("hidden");


    document
        .getElementById("authScreen")
        .classList
        .remove("hidden");



    document
        .getElementById("loginEmail")
        .value = "";


    document
        .getElementById("loginPassword")
        .value = "";


    document
        .getElementById("loginMessage")
        .textContent = "";



    showLogin();

}


/* ==================================================
   NAVIGATION
================================================== */

function showSection(section) {


    document
        .querySelectorAll(".section")
        .forEach(
            function (item) {

                item.classList.add(
                    "hidden"
                );

            }
        );



    const selectedSection =
        document.getElementById(
            section
        );


    if (selectedSection) {

        selectedSection
            .classList
            .remove("hidden");

    }



    /* ---------- REMOVE ACTIVE ---------- */

    document
        .querySelectorAll(".nav-item")
        .forEach(
            function (item) {

                item.classList.remove(
                    "active"
                );

            }
        );



    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );



    /* ---------- DASHBOARD ---------- */

    if (section === "dashboard") {

        const profileName =
            document
                .getElementById("profileName")
                .textContent
                .trim();

        const firstName =
            profileName
                .split(" ")[0];


        document
            .getElementById("pageTitle")
            .textContent =
            `Hello, ${firstName} 👋`;
    }



    /* ---------- TASKS ---------- */

    if (
        section ===
        "tasks"
    ) {

        if (navItems[1]) {

            navItems[1]
                .classList
                .add("active");

        }


        document
            .getElementById(
                "pageTitle"
            )
            .textContent =
            "Manage your tasks";


        renderTasks();

    }



    /* ---------- SMART ---------- */

    if (
        section ===
        "smart"
    ) {

        if (navItems[2]) {

            navItems[2]
                .classList
                .add("active");

        }


        document
            .getElementById(
                "pageTitle"
            )
            .textContent =
            "Plan smarter ✦";

    }

}


/* ==================================================
   LOAD TASKS FROM DATABASE
================================================== */

async function loadTasks() {


    try {


        const response =
            await fetch(
                "/tasks"
            );


        if (
            response.status ===
            401
        ) {

            logoutUser();

            return;

        }



        tasks =
            await response.json();



        updateDashboard();

        renderTasks();

    }

    catch (error) {

        console.error(
            "Unable to load tasks:",
            error
        );

    }

}


/* ==================================================
   OPEN TASK MODAL
================================================== */

function openTaskModal(
    id = null
) {


    editingId = id;



    document
        .getElementById(
            "taskModal"
        )
        .classList
        .remove("hidden");



    /* ---------- EDIT TASK ---------- */

    if (id) {


        const task =
            tasks.find(
                function (t) {

                    return t.id === id;

                }
            );


        if (!task) {

            return;

        }



        document
            .getElementById(
                "modalTitle"
            )
            .textContent =
            "Edit Task";


        document
            .getElementById(
                "taskTitle"
            )
            .value =
            task.title;


        document
            .getElementById(
                "taskDescription"
            )
            .value =
            task.description || "";


        document
            .getElementById(
                "taskPriority"
            )
            .value =
            task.priority;


        document
            .getElementById(
                "taskDueDate"
            )
            .value =
            task.dueDate || "";

    }


    /* ---------- NEW TASK ---------- */

    else {


        document
            .getElementById(
                "modalTitle"
            )
            .textContent =
            "Create a Task";


        document
            .getElementById(
                "taskTitle"
            )
            .value = "";


        document
            .getElementById(
                "taskDescription"
            )
            .value = "";


        document
            .getElementById(
                "taskPriority"
            )
            .value =
            "medium";


        document
            .getElementById(
                "taskDueDate"
            )
            .value = "";

    }

}


/* ==================================================
   CLOSE TASK MODAL
================================================== */

function closeTaskModal() {


    document
        .getElementById(
            "taskModal"
        )
        .classList
        .add("hidden");


    editingId = null;

}


/* ==================================================
   SAVE TASK
================================================== */

async function saveTask() {


    const title =
        document
            .getElementById(
                "taskTitle"
            )
            .value
            .trim();


    const description =
        document
            .getElementById(
                "taskDescription"
            )
            .value
            .trim();


    const priority =
        document
            .getElementById(
                "taskPriority"
            )
            .value;


    const dueDate =
        document
            .getElementById(
                "taskDueDate"
            )
            .value;



    /* ---------- VALIDATION ---------- */

    if (!title) {

        alert(
            "Please enter a task title."
        );

        return;

    }



    try {


        let response;



        /* ==================================================
           EDIT EXISTING TASK
        ================================================== */

        if (editingId) {


            const oldTask =
                tasks.find(
                    function (task) {

                        return (
                            task.id ===
                            editingId
                        );

                    }
                );


            response =
                await fetch(
                    "/tasks/" +
                    editingId,
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                title:
                                    title,

                                description:
                                    description,

                                priority:
                                    priority,

                                dueDate:
                                    dueDate,

                                completed:
                                    oldTask
                                        ? oldTask.completed
                                        : false

                            })

                    }
                );

        }


        /* ==================================================
           CREATE NEW TASK
        ================================================== */

        else {


            response =
                await fetch(
                    "/tasks",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                title:
                                    title,

                                description:
                                    description,

                                priority:
                                    priority,

                                dueDate:
                                    dueDate

                            })

                    }
                );

        }



        /* ---------- SERVER ERROR ---------- */

        if (
            !response.ok
        ) {

            const errorData =
                await response.json();

            alert(
                errorData.message ||
                "Unable to save task."
            );

            return;

        }



        /* ---------- SUCCESS ---------- */

        closeTaskModal();

        await loadTasks();


    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );

    }

}


/* ==================================================
   DELETE TASK
================================================== */

async function deleteTask(id) {


    const confirmed =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmed) {

        return;

    }



    try {


        const response =
            await fetch(
                "/tasks/" +
                id,
                {

                    method: "DELETE"

                }
            );



        if (
            !response.ok
        ) {

            alert(
                "Unable to delete task."
            );

            return;

        }



        await loadTasks();

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );

    }

}


/* ==================================================
   COMPLETE / PENDING
================================================== */

async function toggleTask(id) {


    const task =
        tasks.find(
            function (t) {

                return t.id === id;

            }
        );


    if (!task) {

        return;

    }



    try {


        const response =
            await fetch(
                "/tasks/" +
                id,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            title:
                                task.title,

                            description:
                                task.description,

                            priority:
                                task.priority,

                            dueDate:
                                task.dueDate,

                            completed:
                                !task.completed

                        })

                }
            );



        if (
            !response.ok
        ) {

            alert(
                "Unable to update task."
            );

            return;

        }



        await loadTasks();

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );

    }

}


/* ==================================================
   CREATE TASK HTML
================================================== */

function createTaskHTML(task) {


    return `

        <div class="task-item">


            <button
                type="button"
                class="check ${
                    task.completed
                        ? "completed"
                        : ""
                }"
                onclick="toggleTask(${task.id})"
            >

                ${
                    task.completed
                        ? "✓"
                        : ""
                }

            </button>



            <div class="task-info">


                <div
                    class="task-title ${
                        task.completed
                            ? "done"
                            : ""
                    }"
                >

                    ${
                        escapeHTML(
                            task.title
                        )
                    }

                </div>



                <div class="task-desc">

                    ${
                        escapeHTML(
                            task.description ||
                            "No description"
                        )
                    }

                </div>



                <div class="task-meta">


                    <span
                        class="badge ${
                            task.priority
                        }"
                    >

                        ${
                            task.priority
                                .toUpperCase()
                        }

                    </span>



                    ${
                        task.dueDate

                        ? `

                            <span class="task-date">

                                Due
                                ${
                                    formatDate(
                                        task.dueDate
                                    )
                                }

                            </span>

                          `

                        : ""

                    }



                    <span class="task-date">

                        ${
                            task.completed
                                ? "Completed"
                                : "Pending"
                        }

                    </span>


                </div>

            </div>



            <div class="task-actions">


                <button
                    type="button"
                    class="icon-btn"
                    onclick="openTaskModal(${task.id})"
                    title="Edit"
                >

                    ✎

                </button>



                <button
                    type="button"
                    class="icon-btn"
                    onclick="deleteTask(${task.id})"
                    title="Delete"
                >

                    🗑

                </button>


            </div>

        </div>

    `;

}


/* ==================================================
   RENDER TASKS
================================================== */

function renderTasks() {


    const container =
        document.getElementById(
            "taskList"
        );


    if (!container) {

        return;

    }



    const searchElement =
        document.getElementById(
            "searchInput"
        );


    const statusElement =
        document.getElementById(
            "statusFilter"
        );


    const priorityElement =
        document.getElementById(
            "priorityFilter"
        );



    const search =
        searchElement
            ? searchElement.value
                .toLowerCase()
                .trim()
            : "";


    const status =
        statusElement
            ? statusElement.value
            : "all";


    const priority =
        priorityElement
            ? priorityElement.value
            : "all";



    const filtered =
        tasks.filter(
            function (task) {


                const title =
                    (
                        task.title ||
                        ""
                    )
                    .toLowerCase();


                const description =
                    (
                        task.description ||
                        ""
                    )
                    .toLowerCase();



                const matchesSearch =

                    title.includes(
                        search
                    )

                    ||

                    description.includes(
                        search
                    );



                const matchesStatus =

                    status ===
                    "all"

                    ||

                    (
                        status ===
                        "completed"

                        &&
                        task.completed
                    )

                    ||

                    (
                        status ===
                        "pending"

                        &&
                        !task.completed
                    );



                const matchesPriority =

                    priority ===
                    "all"

                    ||

                    task.priority ===
                    priority;



                return (

                    matchesSearch

                    &&

                    matchesStatus

                    &&

                    matchesPriority

                );

            }
        );



    /* ---------- EMPTY ---------- */

    if (
        filtered.length ===
        0
    ) {

        container.innerHTML = `

            <div class="empty">

                🌱 No tasks found.

                <br>

                Try adding a new task.

            </div>

        `;

        return;

    }



    container.innerHTML =
        filtered
            .map(
                createTaskHTML
            )
            .join("");

}


/* ==================================================
   UPDATE DASHBOARD
================================================== */

function updateDashboard() {


    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function (task) {

                return task.completed;

            }
        ).length;


    const pending =
        total -
        completed;


    const high =
        tasks.filter(
            function (task) {

                return (
                    task.priority ===
                    "high"

                    &&

                    !task.completed
                );

            }
        ).length;



    const totalElement =
        document.getElementById(
            "totalTasks"
        );


    const completedElement =
        document.getElementById(
            "completedTasks"
        );


    const pendingElement =
        document.getElementById(
            "pendingTasks"
        );


    const highElement =
        document.getElementById(
            "highTasks"
        );



    if (totalElement) {

        totalElement
            .textContent =
            total;

    }


    if (completedElement) {

        completedElement
            .textContent =
            completed;

    }


    if (pendingElement) {

        pendingElement
            .textContent =
            pending;

    }


    if (highElement) {

        highElement
            .textContent =
            high;

    }



    /* ---------- RECENT TASKS ---------- */

    const dashboardContainer =
        document.getElementById(
            "dashboardTasks"
        );


    if (!dashboardContainer) {

        return;

    }



    const recent =
        tasks.slice(
            0,
            5
        );



    if (
        recent.length ===
        0
    ) {

        dashboardContainer.innerHTML = `

            <div class="empty">

                No tasks yet.

                <br>

                Add your first task! ✨

            </div>

        `;

        return;

    }



    dashboardContainer.innerHTML =
        recent
            .map(
                createTaskHTML
            )
            .join("");

}


/* ==================================================
   SMART SUGGESTIONS
================================================== */

function generateSuggestions() {


    const box =
        document.getElementById(
            "suggestions"
        );


    if (!box) {

        return;

    }



    const pending =
        tasks.filter(
            function (task) {

                return !task.completed;

            }
        );



    /* ---------- ALL COMPLETE ---------- */

    if (
        pending.length ===
        0
    ) {

        box.innerHTML = `

            <div class="suggestion">

                <strong>
                    🎉 You're all caught up!
                </strong>

                <p>

                    There are no pending tasks.
                    Great job keeping your
                    workspace organized.

                </p>

            </div>

        `;

        return;

    }



    let suggestions = [];



    /* ==================================================
       HIGH PRIORITY
    ================================================== */

    const highPriority =
        pending.filter(
            function (task) {

                return (
                    task.priority ===
                    "high"
                );

            }
        );



    if (
        highPriority.length >
        0
    ) {

        suggestions.push(`

            <div class="suggestion">

                <strong>
                    🔥 Start with high-priority work
                </strong>

                <p>

                    You have
                    ${highPriority.length}
                    high-priority task(s).

                    Consider completing
                    these before lower-priority work.

                </p>

            </div>

        `);

    }



    /* ==================================================
       NEAREST DEADLINE
    ================================================== */

    const withDates =
        pending.filter(
            function (task) {

                return !!task.dueDate;

            }
        );



    if (
        withDates.length >
        0
    ) {


        withDates.sort(
            function (a, b) {

                return (
                    new Date(
                        a.dueDate
                    )
                    -
                    new Date(
                        b.dueDate
                    )
                );

            }
        );



        const earliest =
            withDates[0];



        suggestions.push(`

            <div class="suggestion">

                <strong>
                    📅 Focus on your nearest deadline
                </strong>

                <p>

                    "${escapeHTML(
                        earliest.title
                    )}"

                    is currently your
                    earliest upcoming task.

                </p>

            </div>

        `);

    }



    /* ==================================================
       MEDIUM PRIORITY
    ================================================== */

    const medium =
        pending.filter(
            function (task) {

                return (
                    task.priority ===
                    "medium"
                );

            }
        ).length;



    if (
        medium >
        0
    ) {

        suggestions.push(`

            <div class="suggestion">

                <strong>
                    🌿 Plan your medium-priority tasks
                </strong>

                <p>

                    You have
                    ${medium}
                    medium-priority task(s).

                    Consider scheduling them
                    after your high-priority work.

                </p>

            </div>

        `);

    }



    /* ==================================================
       GENERAL TIP
    ================================================== */

    suggestions.push(`

        <div class="suggestion">

            <strong>
                ✨ Productivity tip
            </strong>

            <p>

                Try completing one focused
                task before moving to the next.
                Consistent small progress helps
                maintain momentum.

            </p>

        </div>

    `);



    box.innerHTML =
        suggestions.join("");

}


/* ==================================================
   DATE FORMAT
================================================== */

function formatDate(date) {


    if (!date) {

        return "";

    }



    const d =
        new Date(date);



    return d.toLocaleDateString(
        "en-IN",
        {

            day: "numeric",

            month: "short",

            year: "numeric"

        }
    );

}


/* ==================================================
   SECURITY HELPER
================================================== */

function escapeHTML(text) {


    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }



    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ==================================================
   LIGHT / DARK MODE
================================================== */

function toggleTheme() {


    document.body
        .classList
        .toggle(
            "dark-mode"
        );



    const isDark =
        document.body
            .classList
            .contains(
                "dark-mode"
            );



    localStorage.setItem(
        "taskBloomTheme",
        isDark
            ? "dark"
            : "light"
    );

}


/* ==================================================
   LOAD SAVED THEME
================================================== */

function loadTheme() {


    const savedTheme =
        localStorage.getItem(
            "taskBloomTheme"
        );



    if (
        savedTheme ===
        "dark"
    ) {

        document.body
            .classList
            .add(
                "dark-mode"
            );

    }

}


/* ==================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
================================================== */

document.addEventListener(
    "click",
    function (event) {


        const modal =
            document.getElementById(
                "taskModal"
            );


        if (
            event.target ===
            modal
        ) {

            closeTaskModal();

        }

    }
);


/* ==================================================
   INITIAL APPLICATION LOAD
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        loadTheme();


        checkLogin();

    }
);

/* ==================================================
   PASSWORD REQUIREMENTS
================================================== */

function checkPasswordRequirements() {

    const password =
        document
            .getElementById("signupPassword")
            .value;

    const confirmPassword =
        document
            .getElementById("signupConfirmPassword")
            .value;


    /* ---------- RULES ---------- */

    const hasLength =
        password.length >= 8;

    const hasUppercase =
        /[A-Z]/.test(password);

    const hasLowercase =
        /[a-z]/.test(password);

    const hasSymbol =
        /[^A-Za-z0-9]/.test(password);

    const passwordsMatch =
        password.length > 0 &&
        password === confirmPassword;


    /* ---------- UPDATE UI ---------- */

    updatePasswordRule(
        "lengthRule",
        hasLength,
        "At least 8 characters"
    );


    updatePasswordRule(
        "uppercaseRule",
        hasUppercase,
        "At least 1 uppercase letter"
    );


    updatePasswordRule(
        "lowercaseRule",
        hasLowercase,
        "At least 1 lowercase letter"
    );


    updatePasswordRule(
        "symbolRule",
        hasSymbol,
        "At least 1 special symbol"
    );


    updatePasswordRule(
        "passwordMatchRule",
        passwordsMatch,
        "Passwords must match"
    );

}


/* ==================================================
   UPDATE PASSWORD RULE
================================================== */

function updatePasswordRule(
    id,
    valid,
    text
) {

    const element =
        document.getElementById(id);


    if (!element) {

        return;

    }


    if (valid) {

        element.textContent =
            "✓ " + text;

        element.classList.add(
            "valid"
        );

    } else {

        element.textContent =
            "○ " + text;

        element.classList.remove(
            "valid"
        );

    }

}


/* ==================================================
   PASSWORD LIVE CHECK
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const password =
            document.getElementById(
                "signupPassword"
            );

        const confirmPassword =
            document.getElementById(
                "signupConfirmPassword"
            );


        if (password) {

            password.addEventListener(
                "input",
                checkPasswordRequirements
            );

        }


        if (confirmPassword) {

            confirmPassword.addEventListener(
                "input",
                checkPasswordRequirements
            );

        }

    }
);
document.body.classList.toggle("dark-mode");