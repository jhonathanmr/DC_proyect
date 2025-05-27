document.addEventListener('DOMContentLoaded', () => {
    const eventForm = document.getElementById('eventForm');
    const timelineNameInput = document.getElementById('timelineName');
    const eventInput = document.getElementById('eventInput');
    const eventDate = document.getElementById('eventDate');
    const eventTime = document.getElementById('eventTime');
    const eventList = document.getElementById('eventList');
    const clearAllButton = document.getElementById('clearAllButton');
    const exportExcelButton = document.getElementById('exportExcelButton');
    const importExcelButton = document.getElementById('importExcelButton');
    const exportPDFButton = document.getElementById('exportPDFButton');
    const timelineTitle = document.getElementById('timelineTitle');
    const eventImageInput = document.getElementById('eventImage');
    const eventFileInput = document.getElementById('eventFile');
    const locationButton = document.createElement('button');
    locationButton.textContent = 'Agregar Ubicación';
    locationButton.type = 'button';
    locationButton.id = 'locationButton';
    locationButton.addEventListener('click', getLocation);
    eventForm.appendChild(locationButton);

    // Cargar eventos desde localStorage
    const loadEvents = () => {
        const timelineData = JSON.parse(localStorage.getItem('timelineData')) || { name: '', events: [] };
        timelineNameInput.value = timelineData.name;
        timelineTitle.textContent = timelineData.name;
        timelineData.events.forEach(event => addEventToDOM(event.text, event.date, event.time, event.imageUrl, event.fileUrl, event.locationUrl, event.id));
    };

    // Guardar eventos en localStorage
    const saveEvents = () => {
        const events = [];
        document.querySelectorAll('#eventList li').forEach(li => {
            const text = li.querySelector('.event-text').textContent;
            const date = li.querySelector('.event-date').textContent;
            const time = li.querySelector('.event-time').textContent;
            const imageUrl = li.querySelector('.event-image') ? li.querySelector('.event-image').src : '';
            const fileUrl = li.querySelector('.attachment-link') ? li.querySelector('.attachment-link').href : '';
            const locationUrl = li.querySelector('a[href*="maps"]') ? li.querySelector('a[href*="maps"]').href : '';
            const id = li.dataset.eventId; // Obtener el ID del evento
            events.push({ text, date, time, imageUrl, fileUrl, locationUrl, id });
        });
        const timelineData = {
            name: timelineNameInput.value,
            events: events
        };
        localStorage.setItem('timelineData', JSON.stringify(timelineData));
    };

    // Agregar evento al DOM
    const addEventToDOM = (eventText, eventDate, eventTime, imageUrl, fileUrl, locationUrl, eventId) => {
        const li = document.createElement('li');
        li.dataset.eventId = eventId || Date.now(); // Asignar un ID único si no se proporciona
        const eventContent = document.createElement('div');
        eventContent.className = 'event-content';

        const spanText = document.createElement('span');
        spanText.textContent = eventText;
        spanText.className = 'event-text';

        const spanDate = document.createElement('span');
        spanDate.textContent = eventDate;
        spanDate.className = 'event-date';

        const spanTime = document.createElement('span');
        spanTime.textContent = eventTime;
        spanTime.className = 'event-time';

        const spanElapsed = document.createElement('span');
        spanElapsed.className = 'event-elapsed';
        spanElapsed.textContent = getElapsedTime(eventDate, eventTime);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
                li.remove();
                saveEvents();
            }
        });

        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.classList.add('edit-button');
        editButton.addEventListener('click', () => {
            showEditModal(li, eventText, eventDate, eventTime);
        });

        eventContent.appendChild(spanText);
        eventContent.appendChild(spanDate);
        eventContent.appendChild(spanTime);
        eventContent.appendChild(spanElapsed);

        // Añadir la imagen como miniatura (solo si existe)
        if (imageUrl) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'event-image-container';

            const img = document.createElement('img');
            img.src = imageUrl;
            img.classList.add('event-image');
            img.style.cursor = 'pointer';

            // Descargar la imagen al hacer clic
            img.addEventListener('click', () => {
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `evento_${eventDate}_${eventTime}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });

            imgContainer.appendChild(img);
            eventContent.appendChild(imgContainer);
        }

        // Añadir archivo adjunto (solo si existe)
        if (fileUrl) {
            const fileLink = document.createElement('a');
            fileLink.href = fileUrl;
            fileLink.textContent = '📎 Archivo adjunto';
            fileLink.target = '_blank';
            fileLink.classList.add('attachment-link');
            eventContent.appendChild(fileLink);
        }

        // Añadir ubicación (solo si existe)
        if (locationUrl) {
            const locationLink = document.createElement('a');
            locationLink.href = locationUrl;
            locationLink.textContent = '📍 Ver ubicación';
            locationLink.target = '_blank';
            eventContent.appendChild(locationLink);
        }

        li.appendChild(eventContent);
        li.appendChild(deleteButton);
        li.appendChild(editButton);

        eventList.appendChild(li);
        sortEventsByDateTime();
    };

    // Función para calcular el tiempo transcurrido
    const getElapsedTime = (eventDate, eventTime) => {
        const eventDateTime = new Date(`${eventDate}T${eventTime}`);
        const now = new Date();
        const diff = now - eventDateTime;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const remainingHours = hours % 24;
        const remainingMinutes = minutes % 60;

        return `${days} día${days !== 1 ? 's' : ''}, ${remainingHours} hora${remainingHours !== 1 ? 's' : ''}, ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}`;
    };

    // Ordenar eventos por fecha, hora y ID (de más reciente a más antiguo)
    const sortEventsByDateTime = () => {
        const events = Array.from(document.querySelectorAll('#eventList li'));
        events.sort((a, b) => {
            const dateA = new Date(`${a.querySelector('.event-date').textContent}T${a.querySelector('.event-time').textContent}`);
            const dateB = new Date(`${b.querySelector('.event-date').textContent}T${b.querySelector('.event-time').textContent}`);
            const idA = parseInt(a.dataset.eventId); // Obtener el ID del evento A
            const idB = parseInt(b.dataset.eventId); // Obtener el ID del evento B

            // Ordenar por fecha y hora descendente
            if (dateB - dateA !== 0) {
                return dateB - dateA;
            } else {
                // Si tienen la misma fecha y hora, ordenar por ID descendente (más reciente primero)
                return idB - idA;
            }
        });
        eventList.innerHTML = '';
        events.forEach(event => eventList.appendChild(event));
    };

    // Mostrar modal de edición
    function showEditModal(liElement, oldText, oldDate, oldTime) {
        const modal = document.getElementById('myModal');
        const modalContent = document.querySelector('.modal-content');
        modalContent.innerHTML = `
            <span class="close">&times;</span>
            <p>Editar evento:</p>
            <input type="text" id="editEventText" value="${oldText}">
            <input type="date" id="editEventDate" value="${oldDate}">
            <input type="time" id="editEventTime" value="${oldTime}">
            <button id="saveEdit">Guardar</button>
        `;
        modal.style.display = 'block';

        const span = document.getElementsByClassName("close")[0];
        span.onclick = function() {
            modal.style.display = "none";
        }

        document.getElementById("saveEdit").onclick = function() {
            const newText = document.getElementById("editEventText").value;
            const newDate = document.getElementById("editEventDate").value;
            const newTime = document.getElementById("editEventTime").value;

            liElement.querySelector('.event-text').textContent = newText;
            liElement.querySelector('.event-date').textContent = newDate;
            liElement.querySelector('.event-time').textContent = newTime;
            liElement.querySelector('.event-elapsed').textContent = getElapsedTime(newDate, newTime);

            sortEventsByDateTime();
            saveEvents();
            modal.style.display = "none";
        }
    }

    // Manejar la exportación a Excel
    exportExcelButton.addEventListener('click', () => {
        const events = [];
        document.querySelectorAll('#eventList li').forEach(li => {
            const text = li.querySelector('.event-text').textContent;
            const date = li.querySelector('.event-date').textContent;
            const time = li.querySelector('.event-time').textContent;
            events.push({ Texto: text, Fecha: date, Hora: time });
        });

        const ws = XLSX.utils.json_to_sheet(events);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Eventos');
        XLSX.writeFile(wb, 'linea_de_tiempo.xlsx');
    });

    // Manejar la importación desde Excel
    importExcelButton.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(firstSheet);
            json.forEach(row => {
                if (row.Texto && row.Fecha && row.Hora) {
                    addEventToDOM(row.Texto, row.Fecha, row.Hora);
                }
            });
            saveEvents();
        };
        reader.readAsArrayBuffer(file);
    });


  // Manejar la exportación a PDF
    exportPDFButton.addEventListener('click', () => {
        const { jsPDF } = window.jspdf; // Obtener jsPDF desde el objeto global
        const doc = new jsPDF('p', 'mm', 'a4'); // Crear un nuevo documento PDF
        const margin = 15; // Márgenes de la página
        const lineHeight = 7; // Altura de cada línea de texto
        const timelineStartX = margin + 10; // Posición horizontal de la línea de tiempo
        let y = margin + 20; // Posición vertical inicial

        // Función para dividir el texto en varias líneas
        const splitText = (text, maxWidth) => {
            const words = text.split(' ');
            const lines = [];
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const width = doc.getTextWidth(currentLine + ' ' + word);
                if (width < maxWidth) {
                    currentLine += ' ' + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);
            return lines;
        };

        // Añadir el título de la línea de tiempo
        doc.setFontSize(18);
        doc.text('Línea de Tiempo de Operaciones', margin, y);
        y += lineHeight * 2;

        // Dibujar la línea de tiempo
        const timelineEndY = doc.internal.pageSize.height - margin;
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 0, 0); // Color negro
        doc.line(timelineStartX, y, timelineStartX, timelineEndY); // Línea vertical

        // Recorrer todos los eventos y añadirlos al PDF
        document.querySelectorAll('#eventList li').forEach(li => {
            const text = li.querySelector('.event-text').textContent;
            const date = li.querySelector('.event-date').textContent;
            const time = li.querySelector('.event-time').textContent;
            const elapsed = li.querySelector('.event-elapsed').textContent;

            // Dibujar el punto en la línea de tiempo
            doc.setFillColor(0, 0, 0); // Color negro
            doc.circle(timelineStartX, y, 2, 'F'); // Punto en la línea de tiempo

            // Añadir el texto del evento al lado de la línea de tiempo
            const eventX = timelineStartX + 10; // Posición horizontal del texto
            const maxWidth = doc.internal.pageSize.width - eventX - margin + 80;

            // Dividir el texto del evento en varias líneas
            const eventLines = splitText(text, maxWidth);

            // Añadir el texto del evento
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0); // Color negro
            eventLines.forEach((line, index) => {
                doc.text(line, eventX, y + index * lineHeight);
            });

            // Añadir fecha, hora y tiempo transcurrido
            doc.setFontSize(10);
            doc.setTextColor(100); // Color gris
            doc.text(`Fecha: ${date}`, eventX, y + eventLines.length * lineHeight);
            doc.text(`Hora: ${time}`, eventX, y + (eventLines.length + 1) * lineHeight);
            

            // Ajustar la posición vertical para el siguiente evento
            y += (eventLines.length + 2) * lineHeight;

            // Añadir la imagen (si existe)
            const image = li.querySelector('.event-image');
            if (image) {
                const imgData = image.src;
                doc.addImage(imgData, 'JPEG', eventX, y, 30, 30); // Ajustar tamaño de la imagen
                y += 40; // Ajustar la posición vertical después de la imagen
            }

            // Añadir el archivo adjunto (si existe)
            const fileLink = li.querySelector('.attachment-link');
            if (fileLink) {
                doc.text(`Archivo adjunto: ${fileLink.textContent}`, eventX, y);
                y += lineHeight;
            }

            // Añadir la ubicación (si existe)
            const locationLink = li.querySelector('a[href*="maps"]');
            if (locationLink) {
                doc.text(`Ubicación: ${locationLink.textContent}`, eventX, y);
                y += lineHeight;
            }

            // Añadir espacio entre eventos
            y += lineHeight * 2;

            // Verificar si se necesita una nueva página
            if (y > doc.internal.pageSize.height - margin) {
                doc.addPage();
                y = margin + 20; // Reiniciar la posición vertical
                // Dibujar la línea de tiempo en la nueva página
                doc.line(timelineStartX, y, timelineStartX, doc.internal.pageSize.height - margin);
            }
        });

        // Guardar el PDF
        doc.save('linea_de_tiempo.pdf');
    });


    // Manejar el envío del formulario
    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const eventText = eventInput.value;
        const dateValue = eventDate.value;
        const timeValue = eventTime.value;
        const locationUrl = locationButton.dataset.location || '';

        const reader = new FileReader();
        reader.onload = function (e) {
            const imageUrl = eventImageInput.files[0] ? e.target.result : '';
            const fileUrl = eventFileInput.files[0] ? URL.createObjectURL(eventFileInput.files[0]) : '';
            addEventToDOM(eventText, dateValue, timeValue, imageUrl, fileUrl, locationUrl);
            saveEvents();
            eventInput.value = '';
            eventDate.value = '';
            eventTime.value = '';
            eventImageInput.value = '';
            eventFileInput.value = '';
            locationButton.dataset.location = '';
        };
        if (eventImageInput.files[0]) {
            reader.readAsDataURL(eventImageInput.files[0]);
        } else {
            reader.onload();
        }
    });

    // Manejar el botón para limpiar todos los eventos
    clearAllButton.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas eliminar todos los eventos?')) {
            const clave = prompt("Ingrese la clave para eliminar los registros:");
            if (clave === '1234') {
                eventList.innerHTML = '';
                localStorage.removeItem('timelineData');
            }
        }
    });

    // Función para obtener la ubicación del usuario y generar un enlace de Google Maps
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
                alert(`Ubicación añadida: ${googleMapsUrl}`);
                locationButton.dataset.location = googleMapsUrl;
            }, () => alert('No se pudo obtener la ubicación.'));
        } else {
            alert('Geolocalización no es soportada en este navegador.');
        }
    }

    // Cargar eventos al iniciar
    loadEvents();
});