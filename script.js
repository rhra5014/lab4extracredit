const events = [];
let editingEventId = null;

function updateLocationOptions(modality) {
    const locationContainer = document.getElementById("location_container");
    const remoteUrlContainer = document.getElementById("remote_url_container");
    
    const locationInput = document.getElementById("event_location");
    const remoteUrlInput = document.getElementById("event_remote_url");

    if (modality === "in-person") {
        locationContainer.style.display = "block";
        remoteUrlContainer.style.display = "none";

        locationInput.required = true;
        remoteUrlInput.required = false;
    } else if (modality == "remote") {
        locationContainer.style.display = "none";
        remoteUrlContainer.style.display = "block";

        locationInput.required = false;
        remoteUrlInput.required = true;
    }
}

function saveEvent() {
    const form = document.getElementById("event_form");

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const modality = document.getElementById("event_modality").value;

    const eventDetails = {
        id: editingEventId !== null ? editingEventId : Date.now(),
        name: document.getElementById("event_name").value,
        weekday: document.getElementById("event_weekday").value,
        time: document.getElementById("event_time").value,
        modality: modality,

        location: modality === "in-person"
            ? document.getElementById("event_location").value
            : null,

        remote_url: modality === "remote"
            ? document.getElementById("event_remote_url").value
            : null,

        attendees: document.getElementById("event_attendees").value,
        category: document.getElementById("event_category").value
    };

    if (editingEventId !== null) {
        const eventIndex = events.findIndex(
            event => event.id === editingEventId
        );

        events[eventIndex] = eventDetails;

        const oldCard = document.querySelector(
            `[data-event-id="${editingEventId}"]`
        );

        if (oldCard) {
            oldCard.remove();
        }
    } else {
        events.push(eventDetails);
    }

    console.log(events);

    addEventToCalendarUI(eventDetails);

    form.reset();

    editingEventId = null;

    const modalElement = document.getElementById("event_modal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.hide();
}

function createEventCard(eventDetails) {
    const eventElement = document.createElement("div");
    eventElement.className = "event row border rounded m-1 py-1";

    eventElement.dataset.eventId = eventDetails.id;

    if (eventDetails.category === "academic") {
        eventElement.classList.add("bg-primary", "text-white");
    } else if (eventDetails.category == "work") {
        eventElement.classList.add("bg-warning");
    } else if (eventDetails.category === "social") {
        eventElement.classList.add("bg-info");
    } else if (eventDetails.category === "personal") {
        eventElement.classList.add("bg-secondary", "text-white");
    }

    const eventContent = document.createElement("div");

    eventContent.innerHTML = `
        <strong>${eventDetails.name}</strong><br>
        ${eventDetails.time}<br>
        ${eventDetails.modality}<br>
        ${eventDetails.category}<br>
        ${eventDetails.location || eventDetails.remote_url}<br>
        ${eventDetails.attendees}
    `;

    eventElement.appendChild(eventContent);

    eventElement.addEventListener("click", function () {
        editEvent(eventDetails.id);
    });

    return eventElement;
}

function addEventToCalendarUI(eventInfo) {
    const eventCard = createEventCard(eventInfo);

    const dayColumn = document.getElementById(
        eventInfo.weekday.toLowerCase()
    );

    dayColumn.appendChild(eventCard);
}

function editEvent(eventId) {
    const eventDetails = events.find(
        event => event.id === eventId
    );

    if (!eventDetails) {
        return;
    }

    editingEventId = eventId;

    document.getElementById("event_name").value = eventDetails.name;
    document.getElementById("event_weekday").value = eventDetails.weekday;
    document.getElementById("event_time").value = eventDetails.time;
    document.getElementById("event_modality").value = eventDetails.modality;
    document.getElementById("event_attendees").value = eventDetails.attendees;
    document.getElementById("event_category").value = eventDetails.category;

    if (eventDetails.modality === "in-person") {
        document.getElementById("event_location").value =
            eventDetails.location;

        document.getElementById("event_remote_url").value = "";

        updateLocationOptions("in-person");
    } else {
        document.getElementById("event_location").value = "";

        document.getElementById("event_remote_url").value =
            eventDetails.remote_url;

        updateLocationOptions("remote");
    }

    document.querySelector(".modal-title").textContent = "Edit Event";

    const modalElement = document.getElementById("event_modal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
}