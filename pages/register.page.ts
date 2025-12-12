import { Locator, Page } from "@playwright/test";


export class RegisterPage {

    private readonly page: Page;
    private readonly emailTxt: Locator;
    private readonly passwordTxt: Locator;
    private readonly confirmPasswordTxt: Locator;
    private readonly pidTxt: Locator;
    private readonly registerBtn: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailTxt = this.page.locator('#email');
        this.passwordTxt = this.page.locator('#password');
        this.confirmPasswordTxt = this.page.locator('#confirmPassword');
        this.pidTxt = this.page.locator('#pid');
        this.registerBtn = this.page.getByRole('button', {
            name: 'Register'
        });
    }

    async register(email: string, password: string, confirmPassword: string, pid: string): Promise<void> {
        await this.emailTxt.fill(email);
        await this.passwordTxt.fill(password);
        await this.confirmPasswordTxt.fill(confirmPassword);
        await this.pidTxt.fill(pid);
        await this.registerBtn.click();
    }

    async fillEmail(email: string): Promise<void> {
        await this.emailTxt.fill(email);
    }

    async fillPassword(password: string): Promise<void> {
        await this.passwordTxt.fill(password);
    }

    async fillConfirmPassword(password: string): Promise<void> {
        await this.confirmPasswordTxt.fill(password);
    }

    async fillPID(pid: string): Promise<void> {
        await this.pidTxt.fill(pid);
    }

    async clickRegister(): Promise<void> {
        await this.registerBtn.click();
    }
}
