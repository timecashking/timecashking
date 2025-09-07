import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { NlpService } from './nlp.service';

@ApiTags('NLP')
@Controller('nlp')
export class NlpController {
  constructor(private readonly nlpService: NlpService) {}

  @Post('parse')
  @ApiOperation({ summary: 'Parse text using NLP' })
  @ApiResponse({ status: 200, description: 'Text parsed' })
  @ApiBody({ schema: { type: 'object', properties: { text: { type: 'string' } } } })
  async parseText(@Body() body: { text: string }) {
    return this.nlpService.parseText(body.text);
  }
}
