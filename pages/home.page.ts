import { expect, Locator, Page } from "@playwright/test";


export class HomePage {

    private readonly page: Page;
    private readonly navBarLogin: Locator;

    constructor(page: Page) {
        this.page = page;
        this.navBarLogin = this.page.getByRole("link", {
            name: 'Login'
        });
    }

    async goToLoginPage(): Promise<void> {
        await this.navBarLogin.click();
    }

    async goToRegisterPage(): Promise<void> {
        const registerLink = this.page.getByRole("link", { name: 'Register' });
        await registerLink.click();
    }

    async shouldWelcomeMsgVisible(email: string): Promise<void> {
        const welcomeMsg = this.page.getByText(`Welcome ${email}`);
        await expect(welcomeMsg).toBeVisible();
    }

}