from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go to the forum page
    page.goto("http://localhost:3000/forum.html")
    page.screenshot(path="jules-scratch/verification/forum-page.png")

    # Click on the first topic
    page.get_by_role("link", name="Bienvenue sur le forum !").click()
    page.wait_for_url("http://localhost:3000/topic.html?id=1")
    page.screenshot(path="jules-scratch/verification/topic-page.png")

    # Fill in the new message form
    page.get_by_placeholder("Votre message").fill("Ceci est un message de test.")
    page.get_by_role("button", name="Envoyer").click()
    page.screenshot(path="jules-scratch/verification/topic-page-new-message.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
