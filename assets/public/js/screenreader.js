document.addEventListener("htmx:afterSwap", function (event) {
  if (event.target.id === "main") {
    console.log("HTMX content swapped, attempting to announce new content.");

    // Ensure content is rendered before focusing and updating the live region
    setTimeout(function () {
      // Focus on a hidden element to force VoiceOver to refresh its rotor
      const hiddenFocusElement = document.createElement("div");
      hiddenFocusElement.setAttribute("tabindex", "-1");
      hiddenFocusElement.setAttribute("aria-hidden", "true");
      document.body.appendChild(hiddenFocusElement);

      // Focus on the newly created element to trigger rotor refresh
      hiddenFocusElement.focus();

      // Now, focus on the first button or input to announce content
      const firstButton = event.target.querySelector("button, input");
      if (firstButton) {
        firstButton.focus();
      }

      // Create a live region dynamically after HTMX swap to trigger screen reader
      const liveRegion = document.createElement("div");
      liveRegion.setAttribute("aria-live", "assertive");
      liveRegion.setAttribute("aria-relevant", "additions");
      liveRegion.setAttribute("aria-hidden", "true");
      liveRegion.textContent = "New content has been loaded.";
      document.body.appendChild(liveRegion);

      // Remove live region after short delay
      setTimeout(function () {
        liveRegion.remove();
      }, 1000); // Extended the delay for live region cleanup

      // Cleanup the hidden element
      setTimeout(function () {
        hiddenFocusElement.remove();
      }, 1500); // Extended the delay to allow for proper refresh
    }, 500); // Adjusted delay to 500ms
  }
});
