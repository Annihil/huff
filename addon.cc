#include <napi.h>
#include "q3huff.h"

Napi::Value Huff(const Napi::CallbackInfo& info, bool encode) {
  Napi::Env env = info.Env();

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
    return env.Null();
  }

  if (!info[0].IsBuffer() || !info[1].IsNumber() || !info[2].IsNumber()) {
    Napi::TypeError::New(env, "Wrong argument types").ThrowAsJavaScriptException();
    return env.Null();
  }

  Napi::Buffer<uint8_t> arg0 = info[0].As<Napi::Buffer<uint8_t>>();
  int arg1 = info[1].As<Napi::Number>().Int32Value();
  int arg2 = info[2].As<Napi::Number>().Int32Value();

  int datalen;
  if (encode) datalen = Huff_CompressPacket((unsigned char*)arg0.Data(), arg1, arg2);
  else datalen = Huff_DecompressPacket((unsigned char*)arg0.Data(), arg1, arg2, INT_MAX);

  return Napi::Number::New(env, datalen);
  //return Napi::Buffer<uint8_t>::New(env, arg0.Data(), datalen);
}

Napi::Value Huff_Enc(const Napi::CallbackInfo& info) {
  return Huff(info, true);
}

Napi::Value Huff_Dec(const Napi::CallbackInfo& info) {
  return Huff(info, false);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "huffCompress"), Napi::Function::New(env, Huff_Enc));
  exports.Set(Napi::String::New(env, "huffDecompress"), Napi::Function::New(env, Huff_Dec));
  return exports;
}

NODE_API_MODULE(addon, Init)
