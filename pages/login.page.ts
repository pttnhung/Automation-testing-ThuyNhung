import { Locator, Page } from "@playwright/test";


export class LoginPage {

    private readonly page: Page;
    private readonly usernameTxt: Locator;
    private readonly passwordTxt: Locator;
    private readonly loginBtn: Locator;

    constructor(page: Page) {
        this.page = page;
        // this.usernameTxt = this.page.getByLabel('Email:');
        const xyz = this.page.locator('#username'); // ❌
        this.usernameTxt = this.page.getByRole('textbox', {
            name: 'Email'
        })
        this.passwordTxt = this.page.getByLabel('Password:');
        this.loginBtn = this.page.getByRole('button', {
            name: 'login'
        });
    }

    async login(username: string, password: string): Promise<void> {
        await this.usernameTxt.fill(username);
        await this.passwordTxt.fill(password);
        await this.loginBtn.click();
    }

}