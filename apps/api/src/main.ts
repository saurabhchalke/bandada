import { Logger, ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import * as cookieParser from "cookie-parser"
import { AppModule } from "./app/app.module"

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true
        })
    )

    const port = 3000

    app.use(cookieParser())
    app.enableCors({
        origin: true,
        credentials: true
    })

    await app.listen(port)

    Logger.log(`🚀 Application is running on: http://localhost:${port}`)
}

bootstrap()
